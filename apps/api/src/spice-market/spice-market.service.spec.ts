import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SpiceMarketService } from './spice-market.service.js';
import { SpiceDryingBatch } from './entities/spice-drying-batch.entity.js';
import { SpicePurityLabTest } from './entities/spice-purity-lab-test.entity.js';
import { SpiceForwardLot } from './entities/spice-forward-lot.entity.js';
import {
  SpiceType,
  SpiceRegion,
  DryingMethod,
  DryingBatchStatus,
  AflatoxinRiskLevel,
  AdulterationTestStatus,
  SpicePurityGrade,
  SpiceFormFactor,
  SpicePackagingType,
  SpiceLotStatus,
} from './enums/spice-market.enum.js';

describe('SpiceMarketService', () => {
  let service: SpiceMarketService;
  let batchRepo: any;
  let labRepo: any;
  let lotRepo: any;

  beforeEach(async () => {
    batchRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'mock-batch-id', ...dto })),
      save: vi.fn((entity) => Promise.resolve(entity)),
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      })),
    };

    labRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'mock-lab-id', ...dto })),
      save: vi.fn((entity) => Promise.resolve(entity)),
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      })),
    };

    lotRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'mock-lot-id', ...dto })),
      save: vi.fn((entity) => Promise.resolve(entity)),
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpiceMarketService,
        {
          provide: getRepositoryToken(SpiceDryingBatch),
          useValue: batchRepo,
        },
        {
          provide: getRepositoryToken(SpicePurityLabTest),
          useValue: labRepo,
        },
        {
          provide: getRepositoryToken(SpiceForwardLot),
          useValue: lotRepo,
        },
      ],
    }).compile();

    service = module.get<SpiceMarketService>(SpiceMarketService);
  });

  describe('calculateSpiceDehydration', () => {
    it('should correctly calculate dehydration yield and moisture loss for Bogura chilli', () => {
      const result = service.calculateSpiceDehydration({
        spiceType: SpiceType.CHILLI,
        freshWeightKg: 2000,
        initialMoisturePct: 80,
        targetMoisturePct: 10,
        dryingMethod: DryingMethod.SOLAR_PARABOLIC_TUNNEL,
      });

      // Dry matter = 2000 * 0.20 = 400 kg
      // Finished weight = 400 / 0.90 = 444 kg
      expect(result.dryMatterKg).toBe(400);
      expect(result.finishedDryWeightKg).toBe(444);
      expect(result.evaporatedWaterKg).toBe(2000 - 444);
      expect(result.dryingDaysEstimate).toBe(4);
      expect(result.cleanlinessBonusPct).toBe(25);
      expect(result.qualityAdvisory).toContain('Safe warehousing threshold');
    });

    it('should calculate traditional raised bed drying with higher drying duration', () => {
      const result = service.calculateSpiceDehydration({
        spiceType: SpiceType.TURMERIC,
        freshWeightKg: 1000,
        initialMoisturePct: 78,
        targetMoisturePct: 9.5,
        dryingMethod: DryingMethod.HYGIENIC_RAISED_BED_SUN,
      });

      expect(result.dryingDaysEstimate).toBe(12);
      expect(result.cleanlinessBonusPct).toBe(0);
    });
  });

  describe('evaluateSpicePurity', () => {
    it('should pass BSTI pure export grade for authentic unadulterated turmeric with high curcumin', () => {
      const result = service.evaluateSpicePurity({
        spiceType: SpiceType.TURMERIC,
        sudanDyeStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
        leadChromateStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
        metanilYellowStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
        moisturePct: 9.0,
        aflatoxinB1Ppb: 1.5,
        curcuminPct: 5.2,
      });

      expect(result.isAdulterated).toBe(false);
      expect(result.purityGrade).toBe(SpicePurityGrade.PURE_GRADE_AAA_EXPORT);
      expect(result.bstiComplianceApproved).toBe(true);
      expect(result.potencyScore).toBe(100);
    });

    it('should reject and flag seizure order when carcinogenic Sudan dye is detected in chilli', () => {
      const result = service.evaluateSpicePurity({
        spiceType: SpiceType.CHILLI,
        sudanDyeStatus: AdulterationTestStatus.POSITIVE_ADULTERATED,
        leadChromateStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
        metanilYellowStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
        moisturePct: 9.0,
        aflatoxinB1Ppb: 2.0,
        scovilleHeatUnits: 45000,
      });

      expect(result.isAdulterated).toBe(true);
      expect(result.purityGrade).toBe(SpicePurityGrade.ADULTERATED_REJECTED);
      expect(result.safetyNotes).toContain('SEIZURE ORDER');
      expect(result.safetyNotes).toContain('Sudan Dyes');
      expect(result.bstiComplianceApproved).toBe(false);
    });

    it('should reject and flag toxic warning when lead chromate is detected in turmeric', () => {
      const result = service.evaluateSpicePurity({
        spiceType: SpiceType.TURMERIC,
        sudanDyeStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
        leadChromateStatus: AdulterationTestStatus.POSITIVE_ADULTERATED,
        metanilYellowStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
        moisturePct: 9.0,
        aflatoxinB1Ppb: 1.0,
      });

      expect(result.isAdulterated).toBe(true);
      expect(result.purityGrade).toBe(SpicePurityGrade.ADULTERATED_REJECTED);
      expect(result.safetyNotes).toContain('Lead Chromate');
    });

    it('should flag aflatoxin mold hazard when Aflatoxin B1 exceeds 5 ppb limit', () => {
      const result = service.evaluateSpicePurity({
        spiceType: SpiceType.CHILLI,
        sudanDyeStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
        leadChromateStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
        metanilYellowStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
        moisturePct: 9.0,
        aflatoxinB1Ppb: 8.5,
      });

      expect(result.isAflatoxinExceeded).toBe(true);
      expect(result.purityGrade).toBe(SpicePurityGrade.SUBSTANDARD_INDUSTRIAL);
      expect(result.bstiComplianceApproved).toBe(false);
    });
  });

  describe('drying batches and telemetry', () => {
    it('should create drying batch and generate batchNumber with regional prefix', async () => {
      batchRepo.count.mockResolvedValue(5);

      const result = await service.createDryingBatch({
        growerCoopName: 'Sariakandi Co-op',
        contactPhone: '+8801712334455',
        region: SpiceRegion.BOGURA_SARIAKANDI_CHAR,
        spiceType: SpiceType.CHILLI,
        varietyName: 'BARI Morich-2',
        initialFreshWeightKg: 1000,
        dryingMethod: DryingMethod.SOLAR_PARABOLIC_TUNNEL,
        chamberTempCelsius: 50.0,
        chamberHumidityPct: 35.0,
        currentMoisturePct: 75.0,
      });

      expect(result.batchNumber).toContain('SPICE-DRY-');
      expect(result.batchNumber).toContain('BOG');
      expect(result.status).toBe(DryingBatchStatus.DRYING_IN_PROGRESS);
    });

    it('should update batch telemetry and trigger critical mold hazard alert when humidity is high', async () => {
      const mockBatch = {
        id: 'batch-1',
        initialFreshWeightKg: 1000,
        chamberTempCelsius: 35.0,
        chamberHumidityPct: 80.0,
        currentMoisturePct: 22.0,
        dryingDaysElapsed: 2,
        status: DryingBatchStatus.DRYING_IN_PROGRESS,
      };
      batchRepo.findOne.mockResolvedValue(mockBatch);

      const updated = await service.updateBatchTelemetry('batch-1', {
        chamberTempCelsius: 38.0,
        chamberHumidityPct: 75.0,
        currentMoisturePct: 18.0,
        dryingDaysElapsed: 3,
      });

      expect(updated.aflatoxinRiskLevel).toBe(
        AflatoxinRiskLevel.CRITICAL_MOLD_HAZARD,
      );
    });
  });

  describe('createLabTest', () => {
    it('should issue authenticity seal number when spice passes all purity tests', async () => {
      labRepo.count.mockResolvedValue(12);

      const result = await service.createLabTest({
        spiceType: SpiceType.CHILLI,
        sampleName: 'Bogura Pure Chilli',
        testingLabName: 'BSTI National Chemical Lab',
        sudanDyeStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
        leadChromateStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
        metanilYellowStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
        moisturePct: 8.8,
        aflatoxinB1Ppb: 1.9,
        scovilleHeatUnits: 52000,
        leadChemistName: 'Dr. Karim',
      });

      expect(result.certificateIssued).toBe(true);
      expect(result.authenticitySealNumber).toContain('BSTI-PURE-CHILLI-');
      expect(result.purityGrade).toBe(SpicePurityGrade.PURE_GRADE_AAA_EXPORT);
    });
  });

  describe('purchaseSpiceLot', () => {
    it('should deduct available quantity upon successful purchase', async () => {
      const mockLot = {
        id: 'lot-1',
        lotCode: 'LOT-CHILLI-001',
        totalQuantityKg: 500,
        availableQuantityKg: 500,
        minimumOrderKg: 50,
        status: SpiceLotStatus.AVAILABLE_FOR_SALE,
      };
      lotRepo.findOne.mockResolvedValue(mockLot);

      const result = await service.purchaseSpiceLot('lot-1', {
        buyerName: 'Radhuni Spices',
        buyerPhone: '+8801812345678',
        orderQuantityKg: 100,
      });

      expect(result.availableQuantityKg).toBe(400);
      expect(result.status).toBe(SpiceLotStatus.AVAILABLE_FOR_SALE);
    });

    it('should throw BadRequestException if order quantity is below minimum order requirement', async () => {
      const mockLot = {
        id: 'lot-1',
        availableQuantityKg: 500,
        minimumOrderKg: 50,
        status: SpiceLotStatus.AVAILABLE_FOR_SALE,
      };
      lotRepo.findOne.mockResolvedValue(mockLot);

      await expect(
        service.purchaseSpiceLot('lot-1', {
          buyerName: 'Small Retailer',
          buyerPhone: '+8801812345678',
          orderQuantityKg: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
