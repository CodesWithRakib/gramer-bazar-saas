import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TeaEstateService } from './tea-estate.service.js';
import {
  TeaGardenRegion,
  TeaProcessingType,
  TeaLeafGrade,
  PluckingStandard,
  AuctionCenter,
  AuctionLotStatus,
} from './enums/tea-estate.enum.js';

describe('TeaEstateService', () => {
  let service: TeaEstateService;
  let mockIntakeRepo: any;
  let mockFactoryRepo: any;
  let mockAuctionRepo: any;

  beforeEach(() => {
    mockIntakeRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'intake-mock-uuid', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: 'intake-mock-uuid', ...entity })),
    };

    mockFactoryRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'factory-mock-uuid', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: 'factory-mock-uuid', ...entity })),
    };

    mockAuctionRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'auction-mock-uuid', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: 'auction-mock-uuid', ...entity })),
    };

    service = new TeaEstateService(mockIntakeRepo, mockFactoryRepo, mockAuctionRepo);
  });

  describe('Green Leaf Intake & Plucking Quality Engine', () => {
    it('should award 5% bonus for superfine "two leaves and a bud" plucking (>= 85%)', () => {
      const result = service.calculateGreenLeafIntake({
        grossWeightKg: 105,
        tareBagWeightKg: 5, // net 100 kg
        finePluckingPercentage: 88.0,
        surfaceWaterDeductionKg: 0,
        ratePerKgBdt: 34.0,
      });

      expect(result.netRawWeightKg).toBe(100);
      expect(result.pluckingStandard).toBe(PluckingStandard.SUPERFINE_TWO_LEAVES_AND_BUD);
      expect(result.finePluckingBonusPercentage).toBe(5.0);
      expect(result.coarseLeafDeductionKg).toBe(0);
      expect(result.netBillableLeafWeightKg).toBe(100);
      // 100 kg * 34 * 1.05 = 3570
      expect(result.totalPayoutBdt).toBe(3570);
    });

    it('should accept standard fine plucking (75% - 84%) with 0% penalty and 0% bonus', () => {
      const result = service.calculateGreenLeafIntake({
        grossWeightKg: 205,
        tareBagWeightKg: 5, // net 200 kg
        finePluckingPercentage: 80.0,
        surfaceWaterDeductionKg: 4.0, // 4 kg rain water deduction
        ratePerKgBdt: 32.0,
      });

      expect(result.netRawWeightKg).toBe(200);
      expect(result.pluckingStandard).toBe(PluckingStandard.STANDARD_FINE_PLUCK);
      expect(result.finePluckingBonusPercentage).toBe(0);
      expect(result.coarseLeafDeductionKg).toBe(0);
      expect(result.netBillableLeafWeightKg).toBe(196); // 200 - 4
      expect(result.totalPayoutBdt).toBe(6272); // 196 * 32
    });

    it('should deduct coarse leaf penalty for plucking with fine percentage < 75%', () => {
      const result = service.calculateGreenLeafIntake({
        grossWeightKg: 105,
        tareBagWeightKg: 5, // net 100 kg
        finePluckingPercentage: 65.0, // 10% below 75% threshold
        surfaceWaterDeductionKg: 0,
        ratePerKgBdt: 30.0,
      });

      expect(result.pluckingStandard).toBe(PluckingStandard.COARSE_OVERGROWN_PLUCK);
      expect(result.coarseLeafDeductionKg).toBe(8); // 100 * 0.10 * 0.8
      expect(result.netBillableLeafWeightKg).toBe(92); // 100 - 8
      expect(result.totalPayoutBdt).toBe(2760); // 92 * 30
      expect(result.recommendation).toContain('Coarse overgrown leaf penalty');
    });
  });

  describe('Tea Liquor Sensory Evaluation & Export Forecast', () => {
    it('should evaluate ultra-premium specialty export grade for cup score >= 88', () => {
      const result = service.evaluateLiquorQuality({
        brightnessScore: 9.4,
        brisknessScore: 9.2,
        liquorBodyScore: 9.0,
        colorScore: 8.8,
        processingType: TeaProcessingType.ARTISANAL_ORTHODOX_BLACK,
        grade: TeaLeafGrade.FTGFOP1,
      });

      // (9.4*3) + (9.2*3) + (9.0*2.5) + (8.8*1.5) = 28.2 + 27.6 + 22.5 + 13.2 = 91.5
      expect(result.overallCupQualityScore).toBe(91.5);
      expect(result.valuationMultiplier).toBe(1.45);
      expect(result.exportSuitability).toContain('Ultra-Premium Specialty Export Grade');
    });

    it('should evaluate prime commercial grade for cup score between 78 and 87.9', () => {
      const result = service.evaluateLiquorQuality({
        brightnessScore: 8.0,
        brisknessScore: 8.2,
        liquorBodyScore: 8.0,
        colorScore: 8.0,
        processingType: TeaProcessingType.CTC_BLACK_TEA,
        grade: TeaLeafGrade.BOP,
      });

      // (8.0*3) + (8.2*3) + (8.0*2.5) + (8.0*1.5) = 24.0 + 24.6 + 20.0 + 12.0 = 80.6
      expect(result.overallCupQualityScore).toBe(80.6);
      expect(result.valuationMultiplier).toBe(1.18);
      expect(result.exportSuitability).toContain('Prime Commercial Auction Grade');
    });
  });

  describe('CRUD, Overview Stats & Auction Bidding', () => {
    it('should aggregate overview statistics correctly', async () => {
      mockIntakeRepo.count.mockResolvedValueOnce(3);
      mockIntakeRepo.find.mockResolvedValueOnce([
        { netBillableLeafWeightKg: 176.5, totalPayoutBdt: 6301 },
        { netBillableLeafWeightKg: 230.0, totalPayoutBdt: 7590 },
      ]);
      mockFactoryRepo.find.mockResolvedValueOnce([
        { finishedTeaYieldKg: 965.0 },
      ]);
      mockAuctionRepo.find.mockResolvedValueOnce([
        { netWeightKg: 2000, currentHighBidBdt: 410, auctionStatus: AuctionLotStatus.ACTIVE_BIDDING },
      ]);

      const stats = await service.getOverviewStats();
      expect(stats.totalIntakeTickets).toBe(3);
      expect(stats.totalGreenLeafKg).toBe(406.5);
      expect(stats.totalSmallholderPayoutBdt).toBe(13891);
      expect(stats.totalProcessedTeaKg).toBe(965);
      expect(stats.totalAuctionKg).toBe(2000);
      expect(stats.totalAuctionValuationBdt).toBe(820000);
      expect(stats.activeLotsCount).toBe(1);
    });

    it('should create green leaf intake with automated quality calculation', async () => {
      const intake = await service.createGreenLeafIntake({
        intakeTicketNumber: 'GLI-NEW-1',
        smallholderFarmerName: 'Rahim Uddin',
        farmerPhone: '+8801700000000',
        gardenNameOrCluster: 'Panchagarh Organic Cluster',
        region: TeaGardenRegion.PANCHAGARH_TERAI_FLATLAND,
        pluckingDate: '2026-07-20',
        grossWeightKg: 105,
        tareBagWeightKg: 5,
        finePluckingPercentage: 88,
        surfaceWaterMoistureDeductionKg: 0,
        ratePerKgBdt: 34,
      });

      expect(intake.id).toBe('intake-mock-uuid');
      expect(mockIntakeRepo.save).toHaveBeenCalled();
    });

    it('should place auction bid and update high bid when bid is higher', async () => {
      mockAuctionRepo.findOne.mockResolvedValueOnce({
        id: 'lot-1',
        currentHighBidBdt: 300,
        reservePricePerKgBdt: 280,
        auctionStatus: AuctionLotStatus.ACTIVE_BIDDING,
        winningBrokerName: 'Old Broker',
      });

      const updated = await service.placeAuctionBid('lot-1', {
        brokerName: 'Apex Tea Brokers',
        bidPerKgBdt: 350,
      });

      expect(updated.currentHighBidBdt).toBe(350);
      expect(updated.winningBrokerName).toBe('Apex Tea Brokers');
    });

    it('should reject auction bid when bid is lower or equal to current high bid', async () => {
      mockAuctionRepo.findOne.mockResolvedValueOnce({
        id: 'lot-1',
        currentHighBidBdt: 300,
        reservePricePerKgBdt: 280,
        auctionStatus: AuctionLotStatus.ACTIVE_BIDDING,
      });

      await expect(
        service.placeAuctionBid('lot-1', {
          brokerName: 'Low Bidder',
          bidPerKgBdt: 290,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject auction bid when lot is not open for bidding', async () => {
      mockAuctionRepo.findOne.mockResolvedValueOnce({
        id: 'lot-1',
        currentHighBidBdt: 300,
        auctionStatus: AuctionLotStatus.KNOCKED_DOWN_SOLD,
      });

      await expect(
        service.placeAuctionBid('lot-1', {
          brokerName: 'Late Bidder',
          bidPerKgBdt: 400,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
