import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EdibleOilService } from './edible-oil.service.js';
import { GhaniPressingBatch } from './entities/ghani-pressing-batch.entity.js';
import { OilPurityLabTest } from './entities/oil-purity-lab-test.entity.js';
import { ArtisanalOilLot } from './entities/artisanal-oil-lot.entity.js';
import {
  OilSeedType,
  OilExtractionMethod,
  GhaniWoodType,
  PressingBatchStatus,
  ArgemoneTestResult,
  AdulterationScreeningStatus,
  OilPurityGrade,
  OilPackagingType,
  OilLotStatus,
  OilRegion,
} from './enums/edible-oil.enum.js';

describe('EdibleOilService', () => {
  let service: EdibleOilService;
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
        EdibleOilService,
        {
          provide: getRepositoryToken(GhaniPressingBatch),
          useValue: batchRepo,
        },
        {
          provide: getRepositoryToken(OilPurityLabTest),
          useValue: labRepo,
        },
        {
          provide: getRepositoryToken(ArtisanalOilLot),
          useValue: lotRepo,
        },
      ],
    }).compile();

    service = module.get<EdibleOilService>(EdibleOilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateOilExtraction', () => {
    it('should correctly calculate cold-press extraction yield and oilcake value for Maghi Deshi Mustard', () => {
      const result = service.calculateOilExtraction({
        seedType: OilSeedType.MUSTARD_MAGHI_DESHI,
        seedWeightKg: 1000,
        extractionMethod: OilExtractionMethod.WOOD_GHANI_COLD_PRESS,
      });

      expect(result.yieldPct).toBe(35.0);
      expect(result.expectedOilKg).toBe(350);
      expect(result.expectedOilLiters).toBeCloseTo(382.51, 1);
      expect(result.oilcakeWeightKg).toBe(630);
      expect(result.oilcakeMarketValueBdt).toBe(31500); // 630 kg * ৳50
      expect(result.isColdPressSafe).toBe(true);
      expect(result.pungencyPreservationPct).toBe(100);
      expect(result.maxRecommendedTempCelsius).toBe(38.0);
    });

    it('should account for high-heat mechanical expeller warning and reduced pungency preservation', () => {
      const result = service.calculateOilExtraction({
        seedType: OilSeedType.MUSTARD_BARI_14,
        seedWeightKg: 500,
        extractionMethod: OilExtractionMethod.STEEL_EXPELLER_MECHANICAL,
      });

      expect(result.yieldPct).toBe(39.0); // 36.5 + 2.5
      expect(result.isColdPressSafe).toBe(false);
      expect(result.pungencyPreservationPct).toBe(45);
      expect(result.maxRecommendedTempCelsius).toBe(95.0);
    });

    it('should correctly calculate sesame seed cold-press extraction yield', () => {
      const result = service.calculateOilExtraction({
        seedType: OilSeedType.SESAME_BLACK,
        seedWeightKg: 200,
        extractionMethod: OilExtractionMethod.WOOD_GHANI_COLD_PRESS,
      });

      expect(result.yieldPct).toBe(44.0);
      expect(result.expectedOilKg).toBe(88);
      expect(result.expectedOilLiters).toBeCloseTo(96.17, 1);
    });
  });

  describe('evaluateOilPurity', () => {
    it('should approve pure extra virgin cold-pressed oil conforming to BSTI acid and peroxide standards', () => {
      const result = service.evaluateOilPurity({
        seedType: OilSeedType.MUSTARD_MAGHI_DESHI,
        freeFattyAcidPct: 0.85,
        peroxideValueMeq: 3.2,
        allylIsothiocyanatePct: 0.38,
        argemoneOilStatus: ArgemoneTestResult.NEGATIVE_PASS_SAFE,
        adulterationStatus: AdulterationScreeningStatus.PURE_UNADULTERATED,
        maxExtractionTempCelsius: 36.5,
      });

      expect(result.isAdulterated).toBe(false);
      expect(result.isArgemoneContaminated).toBe(false);
      expect(result.isAcidValueExceeded).toBe(false);
      expect(result.isPeroxideExceeded).toBe(false);
      expect(result.purityGrade).toBe(OilPurityGrade.GRADE_AAA_EXTRA_VIRGIN_COLD_PRESSED);
      expect(result.bstiComplianceApproved).toBe(true);
      expect(result.qualityScore).toBeGreaterThanOrEqual(95);
    });

    it('should reject batch and mandate seizure when positive for toxic argemone oil', () => {
      const result = service.evaluateOilPurity({
        seedType: OilSeedType.MUSTARD_MAGHI_DESHI,
        freeFattyAcidPct: 1.10,
        peroxideValueMeq: 4.5,
        allylIsothiocyanatePct: 0.30,
        argemoneOilStatus: ArgemoneTestResult.POSITIVE_CONTAMINATED_SEIZED,
        adulterationStatus: AdulterationScreeningStatus.ADULTERATED_TOXIC_ARGEMONE,
        maxExtractionTempCelsius: 38.0,
      });

      expect(result.isArgemoneContaminated).toBe(true);
      expect(result.isAdulterated).toBe(true);
      expect(result.purityGrade).toBe(OilPurityGrade.REJECTED_ADULTERATED);
      expect(result.bstiComplianceApproved).toBe(false);
      expect(result.qualityScore).toBe(0);
      expect(result.verdict).toContain('HAZARDOUS CONTAMINATION DETECTED');
    });

    it('should downgrade purity grade when Free Fatty Acids exceed 1.5%', () => {
      const result = service.evaluateOilPurity({
        seedType: OilSeedType.MUSTARD_BARI_14,
        freeFattyAcidPct: 2.10, // Exceeds 1.5%
        peroxideValueMeq: 6.0,
        allylIsothiocyanatePct: 0.28,
        argemoneOilStatus: ArgemoneTestResult.NEGATIVE_PASS_SAFE,
        adulterationStatus: AdulterationScreeningStatus.PURE_UNADULTERATED,
        maxExtractionTempCelsius: 37.0,
      });

      expect(result.isAcidValueExceeded).toBe(true);
      expect(result.purityGrade).toBe(OilPurityGrade.GRADE_A_STANDARD_VIRGIN);
      expect(result.bstiComplianceApproved).toBe(false);
    });

    it('should flag thermal overheating when extraction temperature exceeds 40°C', () => {
      const result = service.evaluateOilPurity({
        seedType: OilSeedType.MUSTARD_MAGHI_DESHI,
        freeFattyAcidPct: 0.95,
        peroxideValueMeq: 4.0,
        allylIsothiocyanatePct: 0.26,
        argemoneOilStatus: ArgemoneTestResult.NEGATIVE_PASS_SAFE,
        adulterationStatus: AdulterationScreeningStatus.PURE_UNADULTERATED,
        maxExtractionTempCelsius: 48.5, // Overheated > 40°C
      });

      expect(result.isOverheated).toBe(true);
      expect(result.purityGrade).toBe(OilPurityGrade.GRADE_A_STANDARD_VIRGIN);
    });
  });

  describe('CRUD and Lot Operations', () => {
    it('should create and return a ghani pressing batch with initial mass balance', async () => {
      const batch = await service.createGhaniBatch({
        millName: 'Tangail Organic Wood Ghani',
        contactPhone: '+8801711998877',
        region: OilRegion.TANGAIL_DELDUAR,
        seedType: OilSeedType.MUSTARD_MAGHI_DESHI,
        seedVariety: 'Small Maghi Deshi',
        inputSeedWeightKg: 500,
        extractionMethod: OilExtractionMethod.WOOD_GHANI_COLD_PRESS,
        ghaniWoodType: GhaniWoodType.TAMARIND_WOOD,
        maxExtractionTempCelsius: 36.0,
        operatingRpm: 16.0,
        crushingHours: 6.0,
      });

      expect(batch).toBeDefined();
      expect(batch.batchNumber).toContain('GHANI-');
      expect(batch.status).toBe(PressingBatchStatus.CRUSHING_IN_PROGRESS);
      expect(batchRepo.save).toHaveBeenCalled();
    });

    it('should record and verify an official BSTI lab test certificate with QR seal', async () => {
      const test = await service.createOilLabTest({
        seedType: OilSeedType.MUSTARD_MAGHI_DESHI,
        sampleName: 'Delduar Pure Mustard Oil',
        testingLabName: 'BSTI Chemical Lab',
        freeFattyAcidPct: 0.82,
        peroxideValueMeq: 3.1,
        allylIsothiocyanatePct: 0.40,
        argemoneOilStatus: ArgemoneTestResult.NEGATIVE_PASS_SAFE,
        adulterationStatus: AdulterationScreeningStatus.PURE_UNADULTERATED,
        refractiveIndex: 1.466,
        leadChemistName: 'Dr. Shahabuddin Ahmed',
      });

      expect(test).toBeDefined();
      expect(test.isBstiApproved).toBe(true);
      expect(test.authenticitySealNumber).toContain('GBZ-BSTI-GHANI-');
      expect(test.purityGrade).toBe(OilPurityGrade.GRADE_AAA_EXTRA_VIRGIN_COLD_PRESSED);
    });

    it('should allow purchasing artisanal oil lot and decrease available inventory', async () => {
      const mockLot = {
        id: 'lot-uuid-1',
        lotCode: 'OIL-LOT-001',
        lotTitle: 'Pure Cold Pressed Mustard Oil',
        availableVolumeLiters: 100,
        minimumOrderLiters: 5,
        status: OilLotStatus.AVAILABLE_FOR_SALE,
      };

      lotRepo.findOne.mockResolvedValue(mockLot);

      const updated = await service.purchaseOilLot('lot-uuid-1', {
        buyerName: 'Hafizur Rahman',
        buyerPhone: '+8801799887766',
        orderQuantityLiters: 20,
      });

      expect(updated.availableVolumeLiters).toBe(80);
      expect(updated.status).toBe(OilLotStatus.AVAILABLE_FOR_SALE);
    });

    it('should reject purchase order when requested quantity exceeds available stock', async () => {
      const mockLot = {
        id: 'lot-uuid-2',
        lotCode: 'OIL-LOT-002',
        availableVolumeLiters: 30,
        minimumOrderLiters: 5,
        status: OilLotStatus.AVAILABLE_FOR_SALE,
      };

      lotRepo.findOne.mockResolvedValue(mockLot);

      await expect(
        service.purchaseOilLot('lot-uuid-2', {
          buyerName: 'Karim',
          buyerPhone: '+8801700000000',
          orderQuantityLiters: 50, // Exceeds 30L
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
