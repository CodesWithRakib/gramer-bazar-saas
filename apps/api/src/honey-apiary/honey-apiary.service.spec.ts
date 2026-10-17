import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HoneyApiaryService } from './honey-apiary.service.js';
import {
  HoneyFloralSource,
  HoneyHarvestType,
  PurityLabGrade,
  BeeSpecies,
  ApiaryBoxHealthStatus,
  SuperfoodProductType,
} from './enums/honey-apiary.enum.js';

describe('HoneyApiaryService', () => {
  let service: HoneyApiaryService;
  let mockLotRepo: any;
  let mockBoxRepo: any;
  let mockSuperfoodRepo: any;

  beforeEach(() => {
    mockLotRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'lot-mock-uuid', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: 'lot-mock-uuid', ...entity })),
    };

    mockBoxRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'box-mock-uuid', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: 'box-mock-uuid', ...entity })),
    };

    mockSuperfoodRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'sf-mock-uuid', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: 'sf-mock-uuid', ...entity })),
    };

    service = new HoneyApiaryService(mockLotRepo, mockBoxRepo, mockSuperfoodRepo);
  });

  describe('Honey Purity & Adulteration Testing Engine', () => {
    it('should classify pure raw honey as GRADE_A_RAW_UNPROCESSED when moisture <= 18.5% and C4 is negative', () => {
      const result = service.calculateHoneyPurity({
        moisturePercentage: 17.5,
        c4SugarIsotopeRatioPermil: -26.5,
        hmfFreshnessMgPerKg: 12.0,
      });

      expect(result.purityGrade).toBe(PurityLabGrade.GRADE_A_RAW_UNPROCESSED);
      expect(result.bstiCompliance).toBe(true);
      expect(result.isC4Adulterated).toBe(false);
      expect(result.isFermentationRisk).toBe(false);
      expect(result.purityScoreOutOf100).toBe(98);
      expect(result.recommendedRetailPriceBdt).toBe(1200);
    });

    it('should detect adulteration when C4 carbon isotope ratio is above -23.5‰ (HFCS or cane sugar detected)', () => {
      const result = service.calculateHoneyPurity({
        moisturePercentage: 18.0,
        c4SugarIsotopeRatioPermil: -18.2, // Strong C4 cane/corn adulteration
        hmfFreshnessMgPerKg: 45.0,
      });

      expect(result.purityGrade).toBe(PurityLabGrade.ADULTERATED_HFCS_OR_C4_POSITIVE);
      expect(result.bstiCompliance).toBe(false);
      expect(result.isC4Adulterated).toBe(true);
      expect(result.adulterationWarning).toContain('C4 কার্বন আইসোটোপ অনুপাত');
      expect(result.purityScoreOutOf100).toBe(20);
    });

    it('should alert fermentation risk when moisture exceeds 20.0%', () => {
      const result = service.calculateHoneyPurity({
        moisturePercentage: 22.4, // High moisture raw harvest
        c4SugarIsotopeRatioPermil: -25.8,
        hmfFreshnessMgPerKg: 15.0,
      });

      expect(result.purityGrade).toBe(PurityLabGrade.SUBSTANDARD_HIGH_MOISTURE);
      expect(result.bstiCompliance).toBe(false);
      expect(result.isFermentationRisk).toBe(true);
      expect(result.adulterationWarning).toContain('গাঁজন (Fermentation)');
    });
  });

  describe('Apiary Migration Yield & Cross-Pollination Engine', () => {
    it('should compute estimated honey harvest and farmer crop pollination bonus', () => {
      const result = service.calculateApiaryMigrationYield({
        beeBoxesCount: 50,
        floralSource: HoneyFloralSource.MUSTARD_BLOSSOM_CREAM,
        daysInBloom: 30,
      });

      expect(result.beeBoxesCount).toBe(50);
      expect(result.estimatedYieldKg).toBe(900); // 50 * 18 kg
      expect(result.estimatedGrossRevenueBdt).toBe(585000); // 900 * 650
      expect(result.hostFarmerCropBoostPercent).toBe(22);
      expect(result.pollinationEcosystemValueNote).toContain('+22% বৃদ্ধি পাবে');
    });
  });

  describe('Harvest Lots & Apiary Fleet Management', () => {
    it('should create a honey harvest lot with lab certification', async () => {
      const lot = await service.createHarvestLot('beekeeper-1', {
        beekeeperName: 'করিম মৌয়াল',
        beekeeperPhone: '01711223344',
        district: 'সাতক্ষীরা',
        harvestType: HoneyHarvestType.WILD_FOREST_MOUWAL_HARVEST,
        floralSource: HoneyFloralSource.SUNDARBANS_KHALISHA_WILD,
        beeSpecies: BeeSpecies.APIS_DORSATA,
        harvestDate: '2026-04-10',
        grossVolumeKg: 500,
        moisturePercentage: 17.6,
        c4SugarIsotopeRatioPermil: -26.9,
        hmfFreshnessMgPerKg: 11.5,
        labCertificateNo: 'BCSIR-HNY-881',
        forestDeptPermitNo: 'FD-SAT-992',
        wholesalePricePerKgBdt: 1400,
        isForestCertifiedWild: true,
      });

      expect(lot.id).toBe('lot-mock-uuid');
      expect(lot.purityGrade).toBe(PurityLabGrade.GRADE_A_RAW_UNPROCESSED);
      expect(lot.grossVolumeKg).toBe(500);
      expect(mockLotRepo.save).toHaveBeenCalled();
    });

    it('should register and update apiary box colony health and GPS', async () => {
      const mockBox = {
        id: 'box-1',
        boxCode: 'BOX-MELL-TNG-101',
        healthStatus: ApiaryBoxHealthStatus.HEALTHY_BROOD_ACTIVE,
        currentDistrict: 'টাঙ্গাইল',
        currentUpazila: 'মির্জাপুর',
        gpsLatitude: 24.312,
        gpsLongitude: 89.985,
        estimatedHoneyYieldKg: 15.0,
      };
      mockBoxRepo.findOne.mockResolvedValue(mockBox);

      const updated = await service.updateApiaryBoxHealth('box-1', {
        healthStatus: ApiaryBoxHealthStatus.HONEY_SUPER_FULL_READY_TO_EXTRACT,
        estimatedHoneyYieldKg: 18.5,
        notes: 'মৌচাক মধুপূর্ণ, দ্রুত নিষ্কাশন করতে হবে।',
      });

      expect(updated.healthStatus).toBe(ApiaryBoxHealthStatus.HONEY_SUPER_FULL_READY_TO_EXTRACT);
      expect(updated.estimatedHoneyYieldKg).toBe(18.5);
      expect(mockBoxRepo.save).toHaveBeenCalled();
    });

    it('should register royal jelly superfood batch with 10-HDA bio-marker and deep freeze status', async () => {
      const batch = await service.createSuperfoodBatch({
        productType: SuperfoodProductType.FRESH_FROZEN_ROYAL_JELLY,
        producerName: 'সুন্দরবন বায়োটেক',
        harvestLocation: 'মোংলা সুন্দরবন রেঞ্জ',
        weightGrams: 100,
        tenHdaPercentage: 1.95,
        storageTemperatureCelsius: -18.0,
        priceBdt: 2900,
        availableStockCount: 15,
      });

      expect(batch.productType).toBe(SuperfoodProductType.FRESH_FROZEN_ROYAL_JELLY);
      expect(batch.tenHdaPercentage).toBe(1.95);
      expect(batch.coldChainStatus).toBe('SUB_ZERO_DEEP_FROZEN_SECURE');
      expect(mockSuperfoodRepo.save).toHaveBeenCalled();
    });
  });
});
