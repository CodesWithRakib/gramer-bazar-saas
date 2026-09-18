import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Review } from './entities/review.entity.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    private readonly dataSource: DataSource,
  ) {}

  async getProductReviews(productId: string, page = 1, limit = 10) {
    const [items, total] = await this.reviewRepo.findAndCount({
      where: { productId, isApproved: true },
      relations: ['user'], 
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const sanitizedItems = items.map(review => ({
      ...review,
      user: review.user ? { name: `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() || 'Anonymous' } : null,
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

  async addReview(userId: string, productId: string, rating: number, comment?: string) {
    // 1. Duplicate check
    const existingReview = await this.reviewRepo.findOne({
      where: { userId, productId },
    });
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product.');
    }

    // 2. Legitimate purchase validation
    // Find an order item that belongs to this user, is in a completed order, and matches the product ID
    const purchaseQuery = await this.dataSource.query(`
      SELECT o.id 
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN seller_products sp ON sp.id = oi.seller_product_id
      JOIN product_variants pv ON pv.id = sp.product_variant_id
      WHERE o.user_id = $1 
        AND o.status = $2 
        AND pv.product_id = $3
      LIMIT 1
    `, [userId, OrderStatus.DELIVERED, productId]);

    if (purchaseQuery.length === 0) {
      throw new BadRequestException('You can only review products you have legitimately purchased and received.');
    }

    // 3. Add review (auto-approved by default based on config)
    const review = this.reviewRepo.create({
      userId,
      productId,
      rating,
      comment,
      isApproved: true,
    });

    await this.reviewRepo.save(review);
    return review;
  }

  async getUserReviews(userId: string) {
    return this.reviewRepo.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAdminReviews() {
    return this.reviewRepo.find({
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async moderateReview(id: string, isApproved: boolean) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    review.isApproved = isApproved;
    await this.reviewRepo.save(review);
    return review;
  }
}
