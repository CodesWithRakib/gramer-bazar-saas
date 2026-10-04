import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Review } from './entities/review.entity.js';
import { Product } from '../catalog/entities/product.entity.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Reconciles the product's denormalized review counts/averages with the authoritative reviews table.
   * MUST be executed inside a transaction manager.
   * Acquires a row lock on the product to serialize concurrent updates.
   */
  async recalculateProductReviewAggregate(productId: string, manager: EntityManager) {
    // 1. Lock the product row to serialize concurrent aggregations
    const product = await manager
      .createQueryBuilder(Product, 'product')
      .where('product.id = :productId', { productId })
      .setLock('pessimistic_write')
      .getOne();

    if (!product) {
      // Product may have been deleted, no aggregate to update.
      return null;
    }

    // 2. Authoritative aggregate query
    // Includes ONLY reviews where is_approved = true
    const [{ total, average }] = await manager.query(
      `
      SELECT 
        COUNT(*)::int as total, 
        COALESCE(ROUND(AVG(rating)::numeric, 2), 0) as average 
      FROM reviews 
      WHERE product_id = $1 AND is_approved = true
      `,
      [productId]
    );

    const totalReviews = parseInt(total, 10);
    const averageRating = parseFloat(average);

    // 3. Update the locked product
    await manager.query(
      `
      UPDATE products 
      SET 
        total_reviews = $1, 
        average_rating = $2 
      WHERE id = $3
      `,
      [totalReviews, averageRating, productId]
    );

    return { totalReviews, averageRating };
  }

  async getProductReviews(productId: string, page = 1, limit = 10) {
    const [items, total] = await this.reviewRepo.findAndCount({
      where: { productId, isApproved: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const sanitizedItems = items.map((review) => ({
      ...review,
      user: review.user
        ? {
            name:
              `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() || 'Anonymous',
          }
        : null,
    }));

    return {
      data: sanitizedItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addReview(
    userId: string,
    productId: string,
    rating: number,
    comment?: string,
    images?: string[],
  ) {
    // 1. Duplicate check
    const existingReview = await this.reviewRepo.findOne({
      where: { userId, productId },
    });
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product.');
    }

    // 2. Legitimate purchase validation
    // Find an order item that belongs to this user, is in a completed order, and matches the product ID
    const purchaseQuery = await this.dataSource.query(
      `
      SELECT o.id 
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN seller_products sp ON sp.id = oi.seller_product_id
      JOIN product_variants pv ON pv.id = sp.product_variant_id
      WHERE o.user_id = $1 
        AND o.status = $2 
        AND pv.product_id = $3
      LIMIT 1
    `,
      [userId, OrderStatus.DELIVERED, productId],
    );

    if (purchaseQuery.length === 0) {
      throw new BadRequestException(
        'You can only review products you have legitimately purchased and received.',
      );
    }

    // 3. Add review inside a transaction
    return this.dataSource.transaction(async (manager) => {
      const review = manager.create(Review, {
        userId,
        productId,
        rating,
        comment,
        images,
        isApproved: true,
      });

      await manager.save(review);
      await this.recalculateProductReviewAggregate(productId, manager);
      return review;
    });
  }

  async updateReview(
    userId: string,
    reviewId: string,
    rating?: number,
    comment?: string,
    images?: string[],
  ) {
    return this.dataSource.transaction(async (manager) => {
      const review = await manager.findOne(Review, {
        where: { id: reviewId, userId },
      });

      if (!review) throw new NotFoundException('Review not found or unauthorized');

      if (rating !== undefined) review.rating = rating;
      if (comment !== undefined) review.comment = comment;
      if (images !== undefined) review.images = images;

      await manager.save(review);
      await this.recalculateProductReviewAggregate(review.productId, manager);
      return review;
    });
  }

  async deleteReview(userId: string, reviewId: string) {
    return this.dataSource.transaction(async (manager) => {
      const review = await manager.findOne(Review, {
        where: { id: reviewId, userId },
      });

      if (!review) throw new NotFoundException('Review not found or unauthorized');

      const productId = review.productId;
      await manager.remove(review);
      await this.recalculateProductReviewAggregate(productId, manager);
    });
  }

  async getUserReviews(userId: string) {
    return this.reviewRepo.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAdminReviews(page?: number, limit?: number, search?: string) {
    if (!page || !limit) {
      return this.reviewRepo.find({
        relations: ['user', 'product'],
        order: { createdAt: 'DESC' },
      });
    }

    const query = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .orderBy('review.createdAt', 'DESC');

    if (search) {
      query.andWhere(
        '(review.comment ILIKE :search OR user.firstName ILIKE :search OR product.nameEn ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async moderateReview(id: string, isApproved: boolean) {
    return this.dataSource.transaction(async (manager) => {
      const review = await manager.findOne(Review, { where: { id } });
      if (!review) throw new NotFoundException('Review not found');

      if (review.isApproved === isApproved) {
        return review; // Idempotent
      }

      review.isApproved = isApproved;
      await manager.save(review);
      await this.recalculateProductReviewAggregate(review.productId, manager);
      return review;
    });
  }
}
