import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Review } from '../reviews/entities/review.entity.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { SellerReviewQueryDto } from './dto/seller-query.dto.js';
import {
  SellerReviewItemDto,
  SellerReviewListDto,
  SellerReviewSummaryDto,
} from './dto/seller-review.dto.js';

/**
 * Reviews a shop receives on the products it lists.
 *
 * Customer identity is intentionally softened: only the first name and the
 * initial of the last name are exposed, never phone numbers or emails.
 */
@Injectable()
export class SellerReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
  ) {}

  private async resolveShopId(sellerId: string): Promise<string | null> {
    const shop = await this.shopRepository.findOne({
      where: { sellerId },
      select: ['id'],
    });
    return shop?.id ?? null;
  }

  private buildScopedQuery(shopId: string) {
    return this.reviewRepository
      .createQueryBuilder('review')
      .innerJoin('review.product', 'product')
      .innerJoin('product.variants', 'variant')
      .innerJoin('variant.sellerProducts', 'sp')
      .innerJoin('review.user', 'customer')
      .leftJoinAndSelect('review.product', 'productDetail')
      .leftJoinAndSelect('productDetail.images', 'productImage')
      .where('sp.shopId = :shopId', { shopId });
  }

  async listReviews(sellerId: string, query: SellerReviewQueryDto): Promise<SellerReviewListDto> {
    const shopId = await this.resolveShopId(sellerId);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    if (!shopId) {
      return { data: [], meta: { total: 0, page, limit, totalPages: 1 } };
    }

    const qb = this.buildScopedQuery(shopId).distinct(true);

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        new Brackets((where) => {
          where
            .where('productDetail.nameEn ILIKE :search', { search: `%${search}%` })
            .orWhere('productDetail.nameBn ILIKE :search', { search: `%${search}%` })
            .orWhere('review.comment ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (query.rating) {
      qb.andWhere('review.rating = :rating', { rating: query.rating });
    }

    if (query.replyState === 'REPLIED') {
      qb.andWhere('review.sellerReply IS NOT NULL');
    } else if (query.replyState === 'UNREPLIED') {
      qb.andWhere('review.sellerReply IS NULL');
    }

    const [reviews, total] = await qb
      .orderBy('review.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: reviews.map((review) => this.toDto(review)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  private toDto(review: Review): SellerReviewItemDto {
    const product = review.product;
    const primaryImage =
      product?.images?.find((image) => image.isPrimary) ?? product?.images?.[0] ?? null;

    return {
      id: review.id,
      productId: product?.id ?? review.productId,
      productNameEn: product?.nameEn ?? '',
      productNameBn: product?.nameBn ?? '',
      productSlug: product?.slug ?? null,
      productImage: primaryImage?.url ?? null,
      customerName: this.maskCustomerName(
        review.user?.firstName ?? '',
        review.user?.lastName ?? '',
      ),
      rating: review.rating,
      comment: review.comment,
      images: review.images ?? [],
      isApproved: review.isApproved,
      sellerReply: review.sellerReply,
      sellerRepliedAt: review.sellerRepliedAt ? review.sellerRepliedAt.toISOString() : null,
      createdAt: review.createdAt?.toISOString?.() ?? String(review.createdAt),
    };
  }

  /** "Rahim Uddin" -> "Rahim U." so sellers cannot identify customers fully. */
  private maskCustomerName(firstName: string, lastName: string): string {
    const first = firstName?.trim() ?? '';
    const last = lastName?.trim() ?? '';
    if (!first && !last) return 'Customer';
    if (!last) return first;
    return `${first} ${last.charAt(0).toUpperCase()}.`;
  }

  async reply(sellerId: string, reviewId: string, message: string): Promise<SellerReviewItemDto> {
    const shopId = await this.resolveShopId(sellerId);
    if (!shopId) {
      throw new ForbiddenException('No shop is linked to this account');
    }

    const review = await this.buildScopedQuery(shopId)
      .andWhere('review.id = :reviewId', { reviewId })
      .distinct(true)
      .getOne();

    if (!review) {
      throw new NotFoundException('Review not found for your shop products');
    }

    review.sellerReply = message.trim();
    review.sellerRepliedAt = new Date();
    const saved = await this.reviewRepository.save(review);

    return this.toDto(saved);
  }

  async summary(sellerId: string): Promise<SellerReviewSummaryDto> {
    const shopId = await this.resolveShopId(sellerId);
    if (!shopId) {
      return { averageRating: 0, totalReviews: 0, unrepliedCount: 0, distribution: [] };
    }

    const rows = await this.buildScopedQuery(shopId)
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('review.rating')
      .getRawMany<{ rating: string; count: string }>();

    const unreplied = await this.buildScopedQuery(shopId)
      .andWhere('review.sellerReply IS NULL')
      .distinct(true)
      .getCount();

    const totalReviews = rows.reduce((sum, row) => sum + Number(row.count), 0);
    const weighted = rows.reduce((sum, row) => sum + Number(row.rating) * Number(row.count), 0);

    return {
      averageRating: totalReviews > 0 ? Math.round((weighted / totalReviews) * 10) / 10 : 0,
      totalReviews,
      unrepliedCount: unreplied,
      distribution: rows
        .map((row) => ({ rating: Number(row.rating), count: Number(row.count) }))
        .sort((a, b) => b.rating - a.rating),
    };
  }
}
