import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  async getProductReviews(productId: string, page = 1, limit = 10) {
    const [items, total] = await this.reviewRepo.findAndCount({
      where: { productId, isApproved: true },
      relations: ['user'], // Might need to limit what user fields we send
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Sanitize user info before returning
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

  // add mock endpoint to create mock data if we want
}
