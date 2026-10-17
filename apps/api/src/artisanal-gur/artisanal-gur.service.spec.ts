import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ArtisanalGurService } from './artisanal-gur.service.js';
import { DatePalmTappingBatch } from './entities/date-palm-tapping-batch.entity.js';
import { GurPurityLabTest } from './entities/gur-purity-lab-test.entity.js';
import { ArtisanalGurLot } from './entities/artisanal-gur-lot.entity.js';
import {
  GurType,
  GurRegion,
  SapCollectionShift,
  BoilingPanType,
  HydrosulfiteTestResult,
  SugarSyrupAdulterationStatus,
  GurPurityGrade,
  GurPackagingType,
  GurLotStatus,
} from './enums/artisanal-gur.enum.js';

describe('ArtisanalGurService', () => {
  let service: ArtisanalGurService;
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
        ArtisanalGurService,
        {
          provide: getRepositoryToken(DatePalmTappingBatch),
          useValue: batchRepo,
        },
        {
          provide: getRepositoryToken(GurPurityLabTest),
          useValue: labRepo,
        },
        {
          provide: getRepositoryToken(ArtisanalGurLot),
          useValue: lotRepo,
        },
      ],
    }).compile();

    service = module.get<ArtisanalGurService>(ArtisanalGurService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateGurExtraction', () => {
    it('should correctly calculate expected gur yield for Dawn Jiran Nolen Jhola Gur', () => {
      const result = service.calculateGurExtraction({
        gurType: GurType.DATE_PALM_NOLEN_JHOLA,
        rawSapVolumeLiters: 850,
        sapBrixDegrees: 13.8,
        sapCollectionShift: SapCollectionShift.DAWN_JIRAN_PREMIUM,
      });

      expect(result.gurType).toBe(GurType.DATE_PALM_NOLEN_JHOLA);
      expect(result.expectedGurWeightKg).toBeGreaterThan(90);
      expect(result.sapToGurRatio).toBeGreaterThan(7.0);
      expect(result.sapToGurRatio).toBeLessThan(10.0);
      expect(result.recommendedStrikeTempCelsius).toBe(115.5);
      expect(result.aromaPreservationScore).toBe(98);
      expect(result.sweetnessBrixProjected).toBe(78.5);
      expect(result.advisoryMessage).toContain('Dawn Jiran Sap');
    });

    it('should correctly calculate extraction for Solid Patali Gur', () => {
      const result = service.calculateGurExtraction({
        gurType: GurType.DATE_PALM_PATALI_SOLID,
        rawSapVolumeLiters: 1000,
        sapBrixDegrees: 13.5,
        sapCollectionShift: SapCollectionShift.DAY_DAULA_STANDARD,
      });

      expect(result.gurType).toBe(GurType.DATE_PALM_PATALI_SOLID);
      expect(result.recommendedStrikeTempCelsius).toBe(119.5);
      expect(result.aromaPreservationScore).toBe(78);
      expect(result.advisoryMessage).toContain('Day Daula Sap');
    });

    it('should correctly calculate extraction for Sugarcane Gur', () => {
      const result = service.calculateGurExtraction({
        gurType: GurType.SUGARCANE_ORGANIC_SOLID,
        rawSapVolumeLiters: 1000,
        sapBrixDegrees: 18.0,
        sapCollectionShift: SapCollectionShift.EVENING_SWEET_INTAKE,
      });

      expect(result.gurType).toBe(GurType.SUGARCANE_ORGANIC_SOLID);
      expect(result.sapToGurRatio).toBeLessThan(8.0);
      expect(result.recommendedStrikeTempCelsius).toBe(118.5);
      expect(result.byproductChitaMolassesKg).toBeGreaterThan(10);
    });
  });

  describe('evaluateGurPurity', () => {
    it('should classify pure date palm gur as Grade AAA GI Certified Heritage', () => {
      const result = service.evaluateGurPurity({
        gurType: GurType.DATE_PALM_NOLEN_JHOLA,
        hydrosulfitePpm: 0.0,
        hydrosulfiteStatus: HydrosulfiteTestResult.NEGATIVE_ZERO_TOLERANCE_PASS,
        sugarAdulterationStatus: SugarSyrupAdulterationStatus.GENUINE_PURE_SAP,
        sucrosePct: 68.5,
        reducingSugarPct: 12.2,
        isArtificialColoringDetected: false,
        strikeBoilingTempCelsius: 115.5,
      });

      expect(result.purityGrade).toBe(GurPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE);
      expect(result.bstiComplianceApproved).toBe(true);
      expect(result.isHydrosulfiteContaminated).toBe(false);
      expect(result.isSugarAdulterated).toBe(false);
      expect(result.qualityScore).toBe(98);
      expect(result.verdict).toContain('VERIFIED PURE CHEMICAL-FREE');
    });

    it('should reject and flag mandatory seizure when toxic sodium hydrosulfite is detected', () => {
      const result = service.evaluateGurPurity({
        gurType: GurType.DATE_PALM_PATALI_SOLID,
        hydrosulfitePpm: 12.5,
        hydrosulfiteStatus: HydrosulfiteTestResult.POSITIVE_CONTAMINATED_SEIZED,
        sugarAdulterationStatus: SugarSyrupAdulterationStatus.GENUINE_PURE_SAP,
        sucrosePct: 70.0,
        reducingSugarPct: 10.0,
        isArtificialColoringDetected: false,
        strikeBoilingTempCelsius: 119.0,
      });

      expect(result.purityGrade).toBe(GurPurityGrade.REJECTED_ADULTERATED);
      expect(result.bstiComplianceApproved).toBe(false);
      expect(result.isHydrosulfiteContaminated).toBe(true);
      expect(result.qualityScore).toBe(0);
      expect(result.verdict).toContain('HAZARDOUS TOXIC CHEMICAL DETECTED');
      expect(result.safetyNotes).toContain('MANDATORY SEIZURE');
    });

    it('should reject sample when synthetic azo dye is detected', () => {
      const result = service.evaluateGurPurity({
        gurType: GurType.SUGARCANE_ORGANIC_SOLID,
        hydrosulfitePpm: 0.0,
        hydrosulfiteStatus: HydrosulfiteTestResult.NEGATIVE_ZERO_TOLERANCE_PASS,
        sugarAdulterationStatus: SugarSyrupAdulterationStatus.GENUINE_PURE_SAP,
        sucrosePct: 75.0,
        reducingSugarPct: 8.0,
        isArtificialColoringDetected: true,
        strikeBoilingTempCelsius: 118.0,
      });

      expect(result.purityGrade).toBe(GurPurityGrade.REJECTED_ADULTERATED);
      expect(result.bstiComplianceApproved).toBe(false);
      expect(result.isColoringDetected).toBe(true);
      expect(result.qualityScore).toBe(10);
      expect(result.verdict).toContain('SYNTHETIC INDUSTRIAL DYE DETECTED');
    });

    it('should mark commercial standard when diluted with industrial white sugar syrup', () => {
      const result = service.evaluateGurPurity({
        gurType: GurType.DATE_PALM_PATALI_SOLID,
        hydrosulfitePpm: 0.0,
        hydrosulfiteStatus: HydrosulfiteTestResult.NEGATIVE_ZERO_TOLERANCE_PASS,
        sugarAdulterationStatus: SugarSyrupAdulterationStatus.HIGH_SUGAR_ADULTERATED,
        sucrosePct: 86.5,
        reducingSugarPct: 3.1,
        isArtificialColoringDetected: false,
        strikeBoilingTempCelsius: 120.0,
      });

      expect(result.purityGrade).toBe(GurPurityGrade.COMMERCIAL_STANDARD);
      expect(result.bstiComplianceApproved).toBe(false);
      expect(result.isSugarAdulterated).toBe(true);
      expect(result.qualityScore).toBe(45);
      expect(result.verdict).toContain('ADULTERATED WITH INDUSTRIAL REFINED SUGAR SYRUP');
    });

    it('should flag thermal scorched degradation if boiling strike temp exceeds 123°C', () => {
      const result = service.evaluateGurPurity({
        gurType: GurType.DATE_PALM_PATALI_SOLID,
        hydrosulfitePpm: 0.0,
        hydrosulfiteStatus: HydrosulfiteTestResult.NEGATIVE_ZERO_TOLERANCE_PASS,
        sugarAdulterationStatus: SugarSyrupAdulterationStatus.GENUINE_PURE_SAP,
        sucrosePct: 72.0,
        reducingSugarPct: 9.0,
        isArtificialColoringDetected: false,
        strikeBoilingTempCelsius: 125.0,
      });

      expect(result.isOverheated).toBe(true);
      expect(result.verdict).toContain('THERMALLY SCORCHED');
      expect(result.qualityScore).toBe(80);
    });
  });

  describe('Tapping Batches Management', () => {
    it('should create a tapping batch with auto-generated batch number', async () => {
      const dto = {
        gachhiCoopName: 'Faridpur Sadar Gachhi Kalyan Somobay',
        contactPhone: '+8801755112233',
        region: GurRegion.FARIDPUR_SADAR,
        gurType: GurType.DATE_PALM_PATALI_SOLID,
        sapCollectionShift: SapCollectionShift.DAWN_JIRAN_PREMIUM,
        treesTappedCount: 95,
        rawSapVolumeLiters: 500,
        sapBrixDegrees: 13.5,
        strikeBoilingTempCelsius: 119.5,
        panType: BoilingPanType.TRADITIONAL_IRON_KARAI,
        notes: 'Handcrafted Patali Gur setting in earthen moulds.',
      };

      const result = await service.createTappingBatch(dto);
      expect(batchRepo.create).toHaveBeenCalled();
      expect(batchRepo.save).toHaveBeenCalled();
      expect(result.batchNumber).toContain('GUR-');
      expect(result.batchNumber).toContain('FAR');
    });

    it('should update batch boiling parameters and recalculate ratio', async () => {
      const mockBatch = {
        id: 'mock-batch-1',
        rawSapVolumeLiters: 450,
        strikeBoilingTempCelsius: 110.0,
        producedGurWeightKg: 0,
        sapToGurRatio: 8.5,
        status: 'BOILING_IN_PROGRESS',
      };
      batchRepo.findOne.mockResolvedValue(mockBatch);

      const result = await service.updateBatchBoiling('mock-batch-1', {
        strikeBoilingTempCelsius: 115.5,
        producedGurWeightKg: 53.0,
        status: 'BOILING_COMPLETED',
        notes: 'Finished with rich floral aroma.',
      });

      expect(result.strikeBoilingTempCelsius).toBe(115.5);
      expect(result.producedGurWeightKg).toBe(53.0);
      expect(result.sapToGurRatio).toBe(8.49);
      expect(result.status).toBe('BOILING_COMPLETED');
    });
  });

  describe('Lab Tests Management', () => {
    it('should create lab test and issue digital seal for pure GI lot', async () => {
      const dto = {
        batchId: 'mock-batch-1',
        sampleName: 'Jhikargacha Nolen Jhola Gur Sample A-1',
        testingLabName: 'BSTI Regional Certification Laboratory, Khulna',
        gurType: GurType.DATE_PALM_NOLEN_JHOLA,
        hydrosulfitePpm: 0.0,
        hydrosulfiteStatus: HydrosulfiteTestResult.NEGATIVE_ZERO_TOLERANCE_PASS,
        sugarAdulterationStatus: SugarSyrupAdulterationStatus.GENUINE_PURE_SAP,
        sucrosePct: 68.5,
        reducingSugarPct: 12.2,
        totalSolubleSolidsBrix: 78.5,
        leadPpm: 0.01,
        isArtificialColoringDetected: false,
        leadChemistName: 'Dr. Rafiqul Islam, Senior Chemist',
      };

      const result = await service.createGurLabTest(dto);
      expect(labRepo.create).toHaveBeenCalled();
      expect(labRepo.save).toHaveBeenCalled();
      expect(result.testReportNumber).toContain('BSTI-GUR-');
      expect(result.purityGrade).toBe(GurPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE);
      expect(result.isBstiApproved).toBe(true);
      expect(result.isGiCompliant).toBe(true);
      expect(result.authenticitySealNumber).toContain('GBZ-GI-GUR-');
    });

    it('should reject lab test without digital seal when hydrosulfite is present', async () => {
      const dto = {
        sampleName: 'Adulterated Trade Sample',
        testingLabName: 'BFSA Central Food Safety Lab, Dhaka',
        gurType: GurType.DATE_PALM_PATALI_SOLID,
        hydrosulfitePpm: 15.0,
        hydrosulfiteStatus: HydrosulfiteTestResult.POSITIVE_CONTAMINATED_SEIZED,
        sugarAdulterationStatus: SugarSyrupAdulterationStatus.GENUINE_PURE_SAP,
        sucrosePct: 72.0,
        reducingSugarPct: 10.0,
        totalSolubleSolidsBrix: 85.0,
        leadPpm: 0.05,
        isArtificialColoringDetected: false,
        leadChemistName: 'S. Sultana, Executive Magistrate & Analyst',
      };

      const result = await service.createGurLabTest(dto);
      expect(result.purityGrade).toBe(GurPurityGrade.REJECTED_ADULTERATED);
      expect(result.isBstiApproved).toBe(false);
      expect(result.isGiCompliant).toBe(false);
      expect(result.authenticitySealNumber).toBeUndefined();
    });
  });

  describe('Artisanal Lots & Purchase Orders', () => {
    it('should create artisanal lot with stock and value calculations', async () => {
      const dto = {
        lotTitle: 'Fresh Jhikargacha Nolen Jhola Gur (মাটির হাঁড়ি)',
        gurType: GurType.DATE_PALM_NOLEN_JHOLA,
        originRegion: GurRegion.JASHORE_JHIKARGACHA,
        artisanProducerName: 'Jhikargacha Traditional Gachhi Cooperative',
        packagingType: GurPackagingType.TRADITIONAL_EARTHEN_POT_1KG,
        totalWeightKg: 100,
        pricePerKgBdt: 450,
        minimumOrderKg: 2,
        aromaRating: 5,
      };

      const result = await service.createArtisanalLot(dto);
      expect(lotRepo.create).toHaveBeenCalled();
      expect(lotRepo.save).toHaveBeenCalled();
      expect(result.lotCode).toContain('GUR-LOT-');
      expect(result.availableWeightKg).toBe(100);
      expect(result.totalValueBdt).toBe(45000);
      expect(result.status).toBe(GurLotStatus.AVAILABLE_FOR_SALE);
    });

    it('should decrement stock upon valid order and mark sold out when zero', async () => {
      const mockLot = {
        id: 'mock-lot-1',
        availableWeightKg: 10,
        minimumOrderKg: 2,
        status: GurLotStatus.AVAILABLE_FOR_SALE,
      };
      lotRepo.findOne.mockResolvedValue(mockLot);

      const result = await service.purchaseGurLot('mock-lot-1', {
        orderQuantityKg: 10,
        buyerName: 'Bengal Heritage Sweetmeats Ltd.',
        buyerPhone: '+8801811998877',
        deliveryAddress: 'Gulshan-2, Dhaka',
      });

      expect(result.availableWeightKg).toBe(0);
      expect(result.status).toBe(GurLotStatus.SOLD_OUT);
    });

    it('should throw BadRequestException if purchase order exceeds available stock', async () => {
      const mockLot = {
        id: 'mock-lot-1',
        availableWeightKg: 5,
        minimumOrderKg: 1,
        status: GurLotStatus.AVAILABLE_FOR_SALE,
      };
      lotRepo.findOne.mockResolvedValue(mockLot);

      await expect(
        service.purchaseGurLot('mock-lot-1', {
          orderQuantityKg: 15,
          buyerName: 'Sweets House',
          buyerPhone: '+8801700000000',
          deliveryAddress: 'Dhanmondi, Dhaka',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if order quantity is less than minimumOrderKg', async () => {
      const mockLot = {
        id: 'mock-lot-1',
        availableWeightKg: 50,
        minimumOrderKg: 5,
        status: GurLotStatus.AVAILABLE_FOR_SALE,
      };
      lotRepo.findOne.mockResolvedValue(mockLot);

      await expect(
        service.purchaseGurLot('mock-lot-1', {
          orderQuantityKg: 2,
          buyerName: 'Retail Buyer',
          buyerPhone: '+8801700000000',
          deliveryAddress: 'Uttara, Dhaka',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
