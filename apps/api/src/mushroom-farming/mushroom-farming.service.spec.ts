import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { MushroomFarmingService } from './mushroom-farming.service.js';
import {
  MushroomVariety,
  SpawnGenerationStage,
  MushroomProductForm,
  SubstrateSterilizationStatus,
  FruitingChamberAlarmStatus,
} from './enums/mushroom-farming.enum.js';

describe('MushroomFarmingService', () => {
  let service: MushroomFarmingService;
  let mockSpawnRepo: any;
  let mockChamberRepo: any;
  let mockLotRepo: any;

  beforeEach(() => {
    mockSpawnRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'spawn-mock-uuid', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: 'spawn-mock-uuid', ...entity })),
    };

    mockChamberRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'chamber-mock-uuid', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: 'chamber-mock-uuid', ...entity })),
    };

    mockLotRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'lot-mock-uuid', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: 'lot-mock-uuid', ...entity })),
    };

    service = new MushroomFarmingService(mockSpawnRepo, mockChamberRepo, mockLotRepo);
  });

  describe('Dehydration Yield & Moisture Loss Calculator', () => {
    it('should compute Oyster mushroom 10:1 dehydration yield accurately', () => {
      const result = service.calculateDehydrationYield({
        variety: MushroomVariety.OYSTER_WHITE_PO2,
        freshWeightKg: 100.0,
        targetMoisturePercentage: 8.5,
      });

      expect(result.variety).toBe(MushroomVariety.OYSTER_WHITE_PO2);
      expect(result.freshToDryRatio).toBe('10:1');
      expect(result.estimatedDryWeightKg).toBe(10.0);
      expect(result.moistureLossKg).toBe(90.0);
      expect(result.yieldPercentage).toBe(10.0);
      expect(result.estimatedGrossValuationBdt).toBe(16000); // 10 * 1600
      expect(result.shelfLifeComparison).toContain('১২–১৮ মাস');
    });

    it('should compute Ganoderma Reishi 4:1 conversion with high medicinal valuation', () => {
      const result = service.calculateDehydrationYield({
        variety: MushroomVariety.GANODERMA_REISHI_MEDICINAL,
        freshWeightKg: 80.0,
      });

      expect(result.freshToDryRatio).toBe('4:1');
      expect(result.estimatedDryWeightKg).toBe(20.0);
      expect(result.moistureLossKg).toBe(60.0);
      expect(result.yieldPercentage).toBe(25.0);
      expect(result.estimatedGrossValuationBdt).toBe(76000); // 20 * 3800
    });

    it('should compute Button Agaricus 12:1 conversion accurately', () => {
      const result = service.calculateDehydrationYield({
        variety: MushroomVariety.BUTTON_AGARICUS_WINTER,
        freshWeightKg: 120.0,
      });

      expect(result.freshToDryRatio).toBe('12:1');
      expect(result.estimatedDryWeightKg).toBe(10.0);
      expect(result.estimatedGrossValuationBdt).toBe(22000); // 10 * 2200
    });
  });

  describe('Fruiting Chamber Climate Analyzer', () => {
    it('should trigger HIGH_CO2_SUFFOCATION_ALERT and ventilate dampers when CO2 > 1000 ppm', () => {
      const result = service.evaluateChamberClimate({
        temperatureCelsius: 24.0,
        relativeHumidityPercent: 86.0,
        co2Ppm: 1250.0,
      });

      expect(result.alarmStatus).toBe(FruitingChamberAlarmStatus.HIGH_CO2_SUFFOCATION_ALERT);
      expect(result.recommendedDamperState).toBe('OPEN_VENTILATING');
      expect(result.alarmMessage).toContain('কার্বন-ডাই-অক্সাইড');
    });

    it('should trigger LOW_HUMIDITY_DRYOUT_ALERT and activate fogger when humidity < 80%', () => {
      const result = service.evaluateChamberClimate({
        temperatureCelsius: 24.5,
        relativeHumidityPercent: 74.0,
        co2Ppm: 800.0,
      });

      expect(result.alarmStatus).toBe(FruitingChamberAlarmStatus.LOW_HUMIDITY_DRYOUT_ALERT);
      expect(result.recommendedFoggerState).toBe('RUNNING');
      expect(result.alarmMessage).toContain('শুষ্ক আর্দ্রতা সতর্কতা');
    });

    it('should trigger TEMPERATURE_HEAT_STRESS_ALERT when temperature > 28°C', () => {
      const result = service.evaluateChamberClimate({
        temperatureCelsius: 30.5,
        relativeHumidityPercent: 85.0,
        co2Ppm: 750.0,
      });

      expect(result.alarmStatus).toBe(FruitingChamberAlarmStatus.TEMPERATURE_HEAT_STRESS_ALERT);
      expect(result.alarmMessage).toContain('উচ্চ তাপ সতর্কতা');
    });

    it('should report OPTIMAL_GROWTH_CLIMATE when all parameters are in range', () => {
      const result = service.evaluateChamberClimate({
        temperatureCelsius: 23.5,
        relativeHumidityPercent: 87.0,
        co2Ppm: 720.0,
      });

      expect(result.alarmStatus).toBe(FruitingChamberAlarmStatus.OPTIMAL_GROWTH_CLIMATE);
      expect(result.alarmMessage).toBeNull();
      expect(result.climateEvaluationNote).toContain('আদর্শ ফলন পরিবেশ');
    });
  });

  describe('Spawn Batch & Lot Management', () => {
    it('should create a spawn batch with NMDI certification and autoclave pressure', async () => {
      const batch = await service.createSpawnBatch({
        labName: 'সাভার মডেল ল্যাব',
        growerPhone: '01711223344',
        district: 'ঢাকা (সাভার)',
        variety: MushroomVariety.OYSTER_WHITE_PO2,
        generationStage: SpawnGenerationStage.PRIMARY_GRAIN_SPAWN,
        inoculationDate: '2026-10-17',
        packetsCount: 1000,
        sterilizationMethod: SubstrateSterilizationStatus.AUTOCLAVE_PRESSURE_STERILIZED,
        autoclaveTempCelsius: 121.0,
        autoclavePressurePsi: 15.0,
        nmdiLabCertificationNo: 'NMDI-TEST-9901',
        pricePerPacketBdt: 45.0,
        isContaminationFreeCertified: true,
      });

      expect(batch.id).toBe('spawn-mock-uuid');
      expect(batch.batchNumber).toContain('SPAWN-');
      expect(mockSpawnRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when spawn batch is not found', async () => {
      mockSpawnRepo.findOne.mockResolvedValue(null);
      await expect(service.getSpawnBatchById('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should record chamber telemetry with automatic climate alarms', async () => {
      mockChamberRepo.findOne.mockResolvedValue(null);

      const chamber = await service.recordChamberTelemetry({
        chamberCode: 'CHAMBER-TEST-01',
        temperatureCelsius: 24.0,
        relativeHumidityPercent: 88.0,
        co2Ppm: 1150.0,
      });

      expect(chamber.alarmStatus).toBe(FruitingChamberAlarmStatus.HIGH_CO2_SUFFOCATION_ALERT);
      expect(chamber.freshAirDamperState).toBe('OPEN_VENTILATING');
      expect(mockChamberRepo.save).toHaveBeenCalled();
    });

    it('should create dehydrated mushroom lot with hermetic sealing and beta-glucan tracking', async () => {
      const lot = await service.createDehydratedLot({
        processorName: 'সাভার ড্রাই প্রসেসিং হাব',
        district: 'ঢাকা (সাভার)',
        variety: MushroomVariety.GANODERMA_REISHI_MEDICINAL,
        productForm: MushroomProductForm.MEDICINAL_EXTRACT_POWDER,
        processingDate: '2026-10-17',
        freshWeightKg: 100.0,
        dryWeightKg: 25.0,
        moisturePercentage: 7.8,
        polysaccharideBetaGlucanPercent: 29.2,
        isHermeticNitrogenSealed: true,
        pricePerKgBdt: 3800.0,
        availableStockKg: 25.0,
      });

      expect(lot.id).toBe('lot-mock-uuid');
      expect(lot.lotCode).toContain('DRY-');
      expect(mockLotRepo.save).toHaveBeenCalled();
    });
  });
});
