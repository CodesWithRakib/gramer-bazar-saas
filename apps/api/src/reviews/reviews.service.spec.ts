import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Review } from './entities/review.entity.js';
import { ReviewsService } from './reviews.service.js';

describe('ReviewsService', () => {
  let service: ReviewsService;

  const reviewRepo = {
    findOne: vi.fn(),
    create: vi.fn((x) => x),
    save: vi.fn(),
    createQueryBuilder: vi.fn(),
  };
  const dataSource = {
    query: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: getRepositoryToken(Review), useValue: reviewRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addReview', () => {
    it('creates an auto-approved review for a verified purchase', async () => {
      reviewRepo.findOne.mockResolvedValue(null); // no duplicate
      dataSource.query.mockResolvedValue([{ id: 'o1' }]); // purchase found
      reviewRepo.save.mockImplementation(async (r) => ({ ...r, id: 'rev1' }));

      const result = await service.addReview('u1', 'p1', 5, 'Great rice');

      expect(result.isApproved).toBe(true);
      expect(reviewRepo.create).toHaveBeenCalledWith({
        userId: 'u1',
        productId: 'p1',
        rating: 5,
        comment: 'Great rice',
        images: undefined,
        isApproved: true,
      });
    });

    it('rejects a duplicate review by the same user', async () => {
      reviewRepo.findOne.mockResolvedValue({ id: 'existing' });

      await expect(service.addReview('u1', 'p1', 5)).rejects.toThrow(
        /already reviewed/,
      );
      expect(dataSource.query).not.toHaveBeenCalled();
    });

    it('rejects a review without a delivered purchase of that product', async () => {
      reviewRepo.findOne.mockResolvedValue(null);
      dataSource.query.mockResolvedValue([]); // no purchase

      await expect(service.addReview('u1', 'p1', 5)).rejects.toThrow(
        /legitimately purchased/,
      );
      expect(reviewRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('moderateReview', () => {
    it('updates the approval flag', async () => {
      const review = { id: 'rev1', isApproved: true };
      reviewRepo.findOne.mockResolvedValue(review);
      reviewRepo.save.mockImplementation(async (r) => r);

      const result = await service.moderateReview('rev1', false);

      expect(result.isApproved).toBe(false);
      expect(reviewRepo.save).toHaveBeenCalledWith(review);
    });

    it('throws when the review does not exist', async () => {
      reviewRepo.findOne.mockResolvedValue(null);

      await expect(service.moderateReview('ghost', true)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAdminReviews', () => {
    it('returns a {data, meta} envelope', async () => {
      const query = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[{ id: 'rev1' }], 1]),
      };
      reviewRepo.createQueryBuilder.mockReturnValue(query);

      const result = await service.getAdminReviews(1, 20);

      expect(result).toEqual({
        data: [{ id: 'rev1' }],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
    });
  });
});
