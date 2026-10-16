import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AgriFintechService } from './agri-fintech.service.js';
import { CreditTier } from './entities/farmer-credit-score.entity.js';
import { MicroLoanPurpose, MicroLoanStatus } from './entities/micro-loan-application.entity.js';

describe('AgriFintechService', () => {
  let service: AgriFintechService;
  let creditRepo: any;
  let loanRepo: any;

  beforeEach(() => {
    creditRepo = {
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'credit-1', ...dto })),
      save: vi.fn(async (entity) => entity),
    };

    loanRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((dto) => ({ id: 'loan-1', ...dto })),
      save: vi.fn(async (entity) => entity),
      createQueryBuilder: vi.fn(() => ({
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      })),
    };

    service = new AgriFintechService(creditRepo, loanRepo);
  });

  describe('getFarmerCreditScore', () => {
    it('returns existing credit score for seller', async () => {
      const existing = {
        id: 'c-1',
        sellerId: 'seller-1',
        score: 740,
        tier: CreditTier.GOLD,
        maxEligibleAmount: 150000,
      };
      creditRepo.findOne.mockResolvedValue(existing);

      const result = await service.getFarmerCreditScore('seller-1');

      expect(result.score).toBe(740);
      expect(result.tier).toBe(CreditTier.GOLD);
    });

    it('creates baseline credit score for new rural seller', async () => {
      creditRepo.findOne.mockResolvedValue(null);

      const result = await service.getFarmerCreditScore('new-seller-1');

      expect(creditRepo.create).toHaveBeenCalled();
      expect(creditRepo.save).toHaveBeenCalled();
      expect(result.tier).toBe(CreditTier.GOLD);
    });
  });

  describe('calculateAndRefreshScore', () => {
    it('calculates PLATINUM tier for high sales and zero disputes', async () => {
      creditRepo.findOne.mockResolvedValue(null);

      const result = await service.calculateAndRefreshScore('seller-1', {
        fulfillmentRate: 99.0,
        totalSales: 200000.0,
        disputeRate: 0.0,
      });

      expect(result.tier).toBe(CreditTier.PLATINUM);
      expect(result.score).toBeGreaterThanOrEqual(745);
      expect(result.maxEligibleAmount).toBe(300000.0);
    });
  });

  describe('applyForMicroLoan', () => {
    it('throws BadRequestException when requested amount exceeds max limit', async () => {
      const credit = {
        id: 'c-1',
        sellerId: 'seller-1',
        score: 600,
        tier: CreditTier.SILVER,
        maxEligibleAmount: 60000.0,
      };
      creditRepo.findOne.mockResolvedValue(credit);

      await expect(
        service.applyForMicroLoan('seller-1', {
          requestedAmount: 100000.0,
          purpose: MicroLoanPurpose.HIGH_YIELD_SEEDS,
          tenureMonths: 6,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('successfully creates loan application and computes monthly EMI within credit limit', async () => {
      const credit = {
        id: 'c-1',
        sellerId: 'seller-1',
        score: 720,
        tier: CreditTier.GOLD,
        maxEligibleAmount: 150000.0,
      };
      creditRepo.findOne.mockResolvedValue(credit);

      const result = await service.applyForMicroLoan('seller-1', {
        requestedAmount: 50000.0,
        purpose: MicroLoanPurpose.HIGH_YIELD_SEEDS,
        tenureMonths: 6,
      });

      expect(result.requestedAmount).toBe(50000.0);
      expect(result.monthlyEmi).toBeGreaterThan(8000);
      expect(result.status).toBe(MicroLoanStatus.PENDING);
      expect(loanRepo.save).toHaveBeenCalled();
    });
  });

  describe('updateLoanStatus', () => {
    it('throws NotFoundException if loan does not exist', async () => {
      loanRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateLoanStatus('missing-loan', {
          status: MicroLoanStatus.APPROVED,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates status and sets disbursedAt when marked DISBURSED', async () => {
      const loan = {
        id: 'loan-1',
        applicationNumber: 'MLOAN-001',
        status: MicroLoanStatus.APPROVED,
      };
      loanRepo.findOne.mockResolvedValue(loan);

      const result = await service.updateLoanStatus('loan-1', {
        status: MicroLoanStatus.DISBURSED,
      });

      expect(result.status).toBe(MicroLoanStatus.DISBURSED);
      expect(result.disbursedAt).toBeDefined();
    });
  });
});
