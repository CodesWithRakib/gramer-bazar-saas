import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { ArtisanalSweetmeatsService } from './artisanal-sweetmeats.service.js';
import { ChhanaProductionBatch } from './entities/chhana-production-batch.entity.js';
import { SweetmeatPurityLabTest } from './entities/sweetmeat-purity-lab-test.entity.js';
import { ArtisanalSweetmeatLot } from './entities/artisanal-sweetmeat-lot.entity.js';
import {
  SweetmeatType,
  SweetmeatRegion,
  MilkSourceType,
  ChhanaCoagulantType,
  StarchAdulterationTest,
  SweetmeatPurityGrade,
  SweetmeatPackagingType,
  SweetmeatLotStatus,
} from './enums/artisanal-sweetmeats.enum.js';

describe('ArtisanalSweetmeatsService', () => {
  let service: ArtisanalSweetmeatsService;
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
        ArtisanalSweetmeatsService,
        {
          provide: getRepositoryToken(ChhanaProductionBatch),
          useValue: batchRepo,
        },
        {
          provide: getRepositoryToken(SweetmeatPurityLabTest),
          useValue: labRepo,
        },
        {
          provide: getRepositoryToken(ArtisanalSweetmeatLot),
          useValue: lotRepo,
        },
      ],
    }).compile();

    service = module.get<ArtisanalSweetmeatsService>(ArtisanalSweetmeatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateSweetmeatYield', () => {
    it('should correctly calculate expected curd output for Bogura Special Shahi Curd (Doi)', () => {
      const result = service.calculateSweetmeatYield({
        sweetmeatType: SweetmeatType.BOGURA_SPECIAL_CURD_DOI,
        inputMilkVolumeLiters: 500,
        milkFatPct: 5.2,
        milkSource: MilkSourceType.INDIGENOUS_COW_DESHI,
      });

      expect(result.sweetmeatType).toBe(SweetmeatType.BOGURA_SPECIAL_CURD_DOI);
      expect(result.expectedOutputKg).toBe(360);
      expect(result.milkToProductRatio).toBe(1.39);
      expect(result.recommendedCoagulationTempCelsius).toBe(88.0);
      expect(result.optimalMoisturePct).toBe(54.0);
      expect(result.fatRetentionScore).toBe(98);
      expect(result.processingAdvice).toContain('Bogura Shahi Curd');
    });

    it('should calculate delicate chhana output for Natore Authentic Kachagolla', () => {
      const result = service.calculateSweetmeatYield({
        sweetmeatType: SweetmeatType.NATORE_AUTHENTIC_KACHAGOLLA,
        inputMilkVolumeLiters: 400,
        milkFatPct: 4.8,
        milkSource: MilkSourceType.INDIGENOUS_COW_DESHI,
      });

      expect(result.sweetmeatType).toBe(SweetmeatType.NATORE_AUTHENTIC_KACHAGOLLA);
      expect(result.expectedOutputKg).toBeGreaterThan(70);
      expect(result.recommendedCoagulationTempCelsius).toBe(83.0);
      expect(result.optimalMoisturePct).toBe(52.5);
      expect(result.processingAdvice).toContain('Natore Kachagolla');
    });

    it('should boost yield when using high-fat Riverine Buffalo Milk', () => {
      const cowResult = service.calculateSweetmeatYield({
        sweetmeatType: SweetmeatType.PURE_COW_MILK_CHHANA,
        inputMilkVolumeLiters: 1000,
        milkFatPct: 4.5,
        milkSource: MilkSourceType.CROSSBRED_DAIRY_COW,
      });

      const buffaloResult = service.calculateSweetmeatYield({
        sweetmeatType: SweetmeatType.PURE_COW_MILK_CHHANA,
        inputMilkVolumeLiters: 1000,
        milkFatPct: 7.5,
        milkSource: MilkSourceType.RIVERINE_BUFFALO_MILK,
      });

      expect(buffaloResult.expectedOutputKg).toBeGreaterThan(cowResult.expectedOutputKg);
      expect(buffaloResult.fatRetentionScore).toBe(99);
    });

    it('should calculate pure clarified butter yield for Traditional Gawa Ghee', () => {
      const result = service.calculateSweetmeatYield({
        sweetmeatType: SweetmeatType.TRADITIONAL_GAWA_GHEE,
        inputMilkVolumeLiters: 1000,
        milkFatPct: 4.5,
        milkSource: MilkSourceType.INDIGENOUS_COW_DESHI,
      });

      expect(result.sweetmeatType).toBe(SweetmeatType.TRADITIONAL_GAWA_GHEE);
      expect(result.expectedOutputKg).toBe(48.0);
      expect(result.optimalMoisturePct).toBe(0.2);
      expect(result.recommendedCoagulationTempCelsius).toBe(112.0);
    });
  });

  describe('evaluateSweetmeatPurity', () => {
    it('should classify pure artisanal sweetmeat as Grade AAA GI Certified Heritage', () => {
      const result = service.evaluateSweetmeatPurity({
        sweetmeatType: SweetmeatType.BOGURA_SPECIAL_CURD_DOI,
        milkFatDryMatterPct: 29.5,
        moisturePct: 53.0,
        starchAdulterationStatus: StarchAdulterationTest.NEGATIVE_ZERO_TOLERANCE_PASS,
        isDetergentOrUreaDetected: false,
        isHydrogenatedFatVanaspatiDetected: false,
        isArtificialColoringDetected: false,
        coagulationTempCelsius: 85.0,
      });

      expect(result.purityGrade).toBe(SweetmeatPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE);
      expect(result.bstiComplianceApproved).toBe(true);
      expect(result.isStarchAdulterated).toBe(false);
      expect(result.qualityScore).toBe(98);
      expect(result.verdict).toContain('VERIFIED PURE ARTISANAL DAIRY CONFECTIONERY');
    });

    it('should reject and trigger criminal seizure when synthetic milk urea or detergent is detected', () => {
      const result = service.evaluateSweetmeatPurity({
        sweetmeatType: SweetmeatType.PURE_COW_MILK_CHHANA,
        milkFatDryMatterPct: 20.0,
        moisturePct: 60.0,
        starchAdulterationStatus: StarchAdulterationTest.NEGATIVE_ZERO_TOLERANCE_PASS,
        isDetergentOrUreaDetected: true,
        isHydrogenatedFatVanaspatiDetected: false,
        isArtificialColoringDetected: false,
        coagulationTempCelsius: 83.0,
      });

      expect(result.purityGrade).toBe(SweetmeatPurityGrade.REJECTED_ADULTERATED);
      expect(result.bstiComplianceApproved).toBe(false);
      expect(result.isSyntheticMilkChemicalsDetected).toBe(true);
      expect(result.qualityScore).toBe(0);
      expect(result.verdict).toContain('CRIMINAL CONTAMINATION DETECTED');
      expect(result.safetyNotes).toContain('MANDATORY SEIZURE');
    });

    it('should reject sample when hydrogenated vegetable fat (Dalda/Vanaspati) is detected', () => {
      const result = service.evaluateSweetmeatPurity({
        sweetmeatType: SweetmeatType.TRADITIONAL_GAWA_GHEE,
        milkFatDryMatterPct: 98.0,
        moisturePct: 0.5,
        starchAdulterationStatus: StarchAdulterationTest.NEGATIVE_ZERO_TOLERANCE_PASS,
        isDetergentOrUreaDetected: false,
        isHydrogenatedFatVanaspatiDetected: true,
        isArtificialColoringDetected: false,
        coagulationTempCelsius: 110.0,
      });

      expect(result.purityGrade).toBe(SweetmeatPurityGrade.REJECTED_ADULTERATED);
      expect(result.bstiComplianceApproved).toBe(false);
      expect(result.isVanaspatiDetected).toBe(true);
      expect(result.qualityScore).toBe(15);
      expect(result.verdict).toContain('HYDROGENATED VEGETABLE FAT');
    });

    it('should reject sample when starch/flour bulk adulteration is detected', () => {
      const result = service.evaluateSweetmeatPurity({
        sweetmeatType: SweetmeatType.NATORE_AUTHENTIC_KACHAGOLLA,
        milkFatDryMatterPct: 22.0,
        moisturePct: 58.0,
        starchAdulterationStatus: StarchAdulterationTest.POSITIVE_STARCH_DETECTED_SEIZED,
        isDetergentOrUreaDetected: false,
        isHydrogenatedFatVanaspatiDetected: false,
        isArtificialColoringDetected: false,
        coagulationTempCelsius: 84.0,
      });

      expect(result.purityGrade).toBe(SweetmeatPurityGrade.REJECTED_ADULTERATED);
      expect(result.bstiComplianceApproved).toBe(false);
      expect(result.isStarchAdulterated).toBe(true);
      expect(result.qualityScore).toBe(25);
      expect(result.verdict).toContain('STARCH ADULTERATION DETECTED');
    });

    it('should reject sample when prohibited industrial dyes are detected', () => {
      const result = service.evaluateSweetmeatPurity({
        sweetmeatType: SweetmeatType.PORABARI_CHAMCHAM,
        milkFatDryMatterPct: 26.0,
        moisturePct: 48.0,
        starchAdulterationStatus: StarchAdulterationTest.NEGATIVE_ZERO_TOLERANCE_PASS,
        isDetergentOrUreaDetected: false,
        isHydrogenatedFatVanaspatiDetected: false,
        isArtificialColoringDetected: true,
        coagulationTempCelsius: 85.0,
      });

      expect(result.purityGrade).toBe(SweetmeatPurityGrade.REJECTED_ADULTERATED);
      expect(result.isColoringDetected).toBe(true);
      expect(result.qualityScore).toBe(30);
      expect(result.verdict).toContain('PROHIBITED SYNTHETIC DYES DETECTED');
    });

    it('should flag thermal coagulation defect if curdled above 88°C', () => {
      const result = service.evaluateSweetmeatPurity({
        sweetmeatType: SweetmeatType.NATORE_AUTHENTIC_KACHAGOLLA,
        milkFatDryMatterPct: 28.0,
        moisturePct: 49.0,
        starchAdulterationStatus: StarchAdulterationTest.NEGATIVE_ZERO_TOLERANCE_PASS,
        isDetergentOrUreaDetected: false,
        isHydrogenatedFatVanaspatiDetected: false,
        isArtificialColoringDetected: false,
        coagulationTempCelsius: 92.0,
      });

      expect(result.isThermalDefect).toBe(true);
      expect(result.verdict).toContain('THERMAL COAGULATION DEFECT');
      expect(result.qualityScore).toBe(82);
    });
  });

  describe('Chhana Production Batches Management', () => {
    it('should create production batch with auto-generated batch number', async () => {
      const dto = {
        moiraGuildName: 'Sherpur Traditional Doi Karigar Somobay',
        contactPhone: '+8801711223344',
        region: SweetmeatRegion.BOGURA_SADAR,
        sweetmeatType: SweetmeatType.BOGURA_SPECIAL_CURD_DOI,
        milkSource: MilkSourceType.INDIGENOUS_COW_DESHI,
        inputMilkVolumeLiters: 500,
        milkFatPct: 5.2,
        milkSnfPct: 9.0,
        coagulantType: ChhanaCoagulantType.YOGURT_WHEY_FERMENT,
        coagulationTempCelsius: 88.0,
        notes: 'Simmered in earthen furnace; poured into porous clay sras.',
      };

      const result = await service.createProductionBatch(dto);
      expect(batchRepo.create).toHaveBeenCalled();
      expect(batchRepo.save).toHaveBeenCalled();
      expect(result.batchNumber).toContain('SWT-');
      expect(result.batchNumber).toContain('BOG');
    });

    it('should update batch cooking parameters and moisture percentage', async () => {
      const mockBatch = {
        id: 'mock-batch-1',
        producedChhanaKg: 0,
        chhanaMoisturePct: 50.0,
        status: 'CURDLING_IN_PROGRESS',
      };
      batchRepo.findOne.mockResolvedValue(mockBatch);

      const result = await service.updateBatchCooking('mock-batch-1', {
        producedChhanaKg: 85.0,
        chhanaMoisturePct: 52.5,
        status: 'KNEADING_AND_COOKING',
        notes: 'Coagulation complete with sweet aroma.',
      });

      expect(result.producedChhanaKg).toBe(85.0);
      expect(result.chhanaMoisturePct).toBe(52.5);
      expect(result.status).toBe('KNEADING_AND_COOKING');
    });
  });

  describe('Lab Tests Management', () => {
    it('should create lab test and issue digital seal for pure GI sweetmeat', async () => {
      const dto = {
        batchId: 'mock-batch-1',
        sweetmeatType: SweetmeatType.BOGURA_SPECIAL_CURD_DOI,
        sampleName: 'Bogura Special Shahi Curd (মাটির সরা)',
        testingLabName: 'BSTI Regional Laboratory, Rajshahi',
        milkFatDryMatterPct: 29.5,
        moisturePct: 53.0,
        starchAdulterationStatus: StarchAdulterationTest.NEGATIVE_ZERO_TOLERANCE_PASS,
        isDetergentOrUreaDetected: false,
        isHydrogenatedFatVanaspatiDetected: false,
        isArtificialColoringDetected: false,
        totalAcidityLacticPct: 0.88,
        sensoryTasteScore: 9.8,
        leadChemistName: 'Dr. Anowar Hossain, Chief Chemist',
      };

      const result = await service.createSweetmeatLabTest(dto);
      expect(labRepo.create).toHaveBeenCalled();
      expect(labRepo.save).toHaveBeenCalled();
      expect(result.testReportNumber).toContain('BSTI-SWT-');
      expect(result.purityGrade).toBe(SweetmeatPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE);
      expect(result.isBstiApproved).toBe(true);
      expect(result.isGiCompliant).toBe(true);
      expect(result.authenticitySealNumber).toContain('GBZ-GI-SWT-');
    });

    it('should reject lab test without digital seal when starch is detected', async () => {
      const dto = {
        sweetmeatType: SweetmeatType.NATORE_AUTHENTIC_KACHAGOLLA,
        sampleName: 'Adulterated Commercial Sample',
        testingLabName: 'BFSA Central Food Safety Lab, Dhaka',
        milkFatDryMatterPct: 18.0,
        moisturePct: 60.0,
        starchAdulterationStatus: StarchAdulterationTest.POSITIVE_STARCH_DETECTED_SEIZED,
        isDetergentOrUreaDetected: false,
        isHydrogenatedFatVanaspatiDetected: false,
        isArtificialColoringDetected: false,
        totalAcidityLacticPct: 1.20,
        sensoryTasteScore: 3.5,
        leadChemistName: 'M. Kabiruzzaman, Senior Analyst',
      };

      const result = await service.createSweetmeatLabTest(dto);
      expect(result.purityGrade).toBe(SweetmeatPurityGrade.REJECTED_ADULTERATED);
      expect(result.isBstiApproved).toBe(false);
      expect(result.isGiCompliant).toBe(false);
      expect(result.authenticitySealNumber).toBeUndefined();
    });
  });

  describe('Artisanal Lots & Purchase Orders', () => {
    it('should create artisanal lot with stock and value calculations', async () => {
      const dto = {
        lotTitle: 'Special Bogura Shahi Red Curd (বগুড়ার খাঁটি ক্ষীরসা লাল দই)',
        moiraProducerName: 'Sherpur Traditional Doi Karigar Somobay',
        originRegion: SweetmeatRegion.BOGURA_SADAR,
        sweetmeatType: SweetmeatType.BOGURA_SPECIAL_CURD_DOI,
        packagingType: SweetmeatPackagingType.POROUS_CLAY_SRA_1KG,
        totalWeightKg: 150,
        pricePerKgBdt: 420,
        minimumOrderKg: 2,
        textureSoftnessRating: 5,
      };

      const result = await service.createArtisanalLot(dto);
      expect(lotRepo.create).toHaveBeenCalled();
      expect(lotRepo.save).toHaveBeenCalled();
      expect(result.lotCode).toContain('SWT-LOT-');
      expect(result.availableWeightKg).toBe(150);
      expect(result.totalValueBdt).toBe(63000);
      expect(result.status).toBe(SweetmeatLotStatus.AVAILABLE_FOR_SALE);
    });

    it('should decrement stock upon valid order and mark sold out when zero', async () => {
      const mockLot = {
        id: 'mock-lot-1',
        availableWeightKg: 10,
        minimumOrderKg: 2,
        status: SweetmeatLotStatus.AVAILABLE_FOR_SALE,
      };
      lotRepo.findOne.mockResolvedValue(mockLot);

      const result = await service.purchaseSweetmeatLot('mock-lot-1', {
        orderQuantityKg: 10,
        buyerName: 'Dhaka Grand Confectioneries',
        buyerPhone: '+8801700112233',
        deliveryAddress: 'Banani, Dhaka',
      });

      expect(result.availableWeightKg).toBe(0);
      expect(result.status).toBe(SweetmeatLotStatus.SOLD_OUT);
    });

    it('should throw BadRequestException if purchase order exceeds available stock', async () => {
      const mockLot = {
        id: 'mock-lot-1',
        availableWeightKg: 5,
        minimumOrderKg: 1,
        status: SweetmeatLotStatus.AVAILABLE_FOR_SALE,
      };
      lotRepo.findOne.mockResolvedValue(mockLot);

      await expect(
        service.purchaseSweetmeatLot('mock-lot-1', {
          orderQuantityKg: 20,
          buyerName: 'Sweet Shop',
          buyerPhone: '+8801700000000',
          deliveryAddress: 'Uttara, Dhaka',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if order quantity is less than minimumOrderKg', async () => {
      const mockLot = {
        id: 'mock-lot-1',
        availableWeightKg: 50,
        minimumOrderKg: 5,
        status: SweetmeatLotStatus.AVAILABLE_FOR_SALE,
      };
      lotRepo.findOne.mockResolvedValue(mockLot);

      await expect(
        service.purchaseSweetmeatLot('mock-lot-1', {
          orderQuantityKg: 2,
          buyerName: 'Retail Buyer',
          buyerPhone: '+8801700000000',
          deliveryAddress: 'Mirpur, Dhaka',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
