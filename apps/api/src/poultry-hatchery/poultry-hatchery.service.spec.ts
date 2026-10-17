import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { PoultryHatcheryService } from './poultry-hatchery.service.js';
import {
  PoultryBreedType,
  HatcheryFlockStage,
  VaccinationStatus,
  BrooderShedAlarmStatus,
  EggQualityGrade,
} from './enums/poultry-hatchery.enum.js';

describe('PoultryHatcheryService', () => {
  let service: PoultryHatcheryService;
  let mockBatchRepo: any;
  let mockShedRepo: any;
  let mockEggRepo: any;

  beforeEach(() => {
    mockBatchRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'batch-mock-uuid', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: 'batch-mock-uuid', ...entity })),
    };

    mockShedRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'shed-mock-uuid', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: 'shed-mock-uuid', ...entity })),
    };

    mockEggRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'egg-mock-uuid', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: 'egg-mock-uuid', ...entity })),
    };

    service = new PoultryHatcheryService(mockBatchRepo, mockShedRepo, mockEggRepo);
  });

  describe('FCR & Flock Mortality Calculator', () => {
    it('should compute Broiler FCR <= 1.55 as EXCELLENT when weight gain is optimal', () => {
      // 5,000 birds at 2,000g = 10,000 kg meat. Consumed 15,000 kg feed => FCR = 1.50
      const result = service.calculateFlockFcrAndMortality({
        breedType: PoultryBreedType.BROILER_COBB_500,
        initialChickCount: 5200,
        currentLiveCount: 5000,
        cumulativeFeedConsumedKg: 15000,
        averageWeightGrams: 2000,
      });

      expect(result.calculatedFcr).toBe(1.5);
      expect(result.fcrRating).toBe('EXCELLENT');
      expect(result.mortalityPercentage).toBe(3.85);
      expect(result.isMortalityAlarm).toBe(true);
      expect(result.mortalityAlertMessage).toContain('৩.৫% অতিক্রম');
    });

    it('should compute Sonali FCR <= 2.2 as EXCELLENT with normal mortality', () => {
      // 3,000 birds at 1,200g = 3,600 kg meat. Consumed 7,560 kg feed => FCR = 2.10
      const result = service.calculateFlockFcrAndMortality({
        breedType: PoultryBreedType.SONALI_CLASSIC,
        initialChickCount: 3050,
        currentLiveCount: 3000,
        cumulativeFeedConsumedKg: 7560,
        averageWeightGrams: 1200,
      });

      expect(result.calculatedFcr).toBe(2.1);
      expect(result.fcrRating).toBe('EXCELLENT');
      expect(result.mortalityPercentage).toBe(1.64);
      expect(result.isMortalityAlarm).toBe(false);
      expect(result.mortalityAlertMessage).toBeNull();
    });

    it('should alert POOR_FEED_WASTE when broiler FCR exceeds 1.75', () => {
      // 4,000 birds at 1,800g = 7,200 kg meat. Consumed 14,000 kg feed => FCR = 1.94
      const result = service.calculateFlockFcrAndMortality({
        breedType: PoultryBreedType.BROILER_COBB_500,
        initialChickCount: 4050,
        currentLiveCount: 4000,
        cumulativeFeedConsumedKg: 14000,
        averageWeightGrams: 1800,
      });

      expect(result.calculatedFcr).toBe(1.94);
      expect(result.fcrRating).toBe('POOR_FEED_WASTE');
    });
  });

  describe('Commercial Table Egg Weight Sorter & Grading', () => {
    it('should sort eggs >= 65g into GRADE_AA_JUMBO_OVER_65G', () => {
      const result = service.evaluateEggGrading({
        averageEggWeightGrams: 66.5,
        totalEggsCount: 7200,
      });

      expect(result.eggGrade).toBe(EggQualityGrade.GRADE_AA_JUMBO_OVER_65G);
      expect(result.pricePerHundredBdt).toBe(1250);
      expect(result.commercialCasesCount).toBe(20); // 7200 / 360 = 20
      expect(result.totalValuationBdt).toBe(90000); // (7200 / 100) * 1250
    });

    it('should sort eggs between 58g and 64g into GRADE_A_LARGE_58_64G', () => {
      const result = service.evaluateEggGrading({
        averageEggWeightGrams: 61.0,
        totalEggsCount: 3600,
      });

      expect(result.eggGrade).toBe(EggQualityGrade.GRADE_A_LARGE_58_64G);
      expect(result.pricePerHundredBdt).toBe(1150);
      expect(result.commercialCasesCount).toBe(10);
    });

    it('should sort eggs < 50g into GRADE_C_PULLET_UNDER_50G', () => {
      const result = service.evaluateEggGrading({
        averageEggWeightGrams: 47.5,
        totalEggsCount: 1800,
      });

      expect(result.eggGrade).toBe(EggQualityGrade.GRADE_C_PULLET_UNDER_50G);
      expect(result.pricePerHundredBdt).toBe(880);
    });
  });

  describe('Brooder Shed IoT Telemetry & Threshold Alarms', () => {
    it('should trigger AMMONIA_TOXIC_SPIKE_ALERT and run exhaust fan when ammonia > 25 ppm', async () => {
      mockShedRepo.findOne.mockResolvedValue(null);

      const shed = await service.recordBrooderTelemetry({
        shedCode: 'SHED-TEST-99',
        temperatureCelsius: 33.0,
        relativeHumidityPercent: 62.0,
        ammoniaPpm: 28.5,
      });

      expect(shed.alarmStatus).toBe(BrooderShedAlarmStatus.AMMONIA_TOXIC_SPIKE_ALERT);
      expect(shed.exhaustFanState).toBe('RUNNING');
      expect(shed.alarmMessage).toContain('অ্যামোনিয়া গ্যাস');
    });

    it('should trigger TEMPERATURE_COLD_CHILLING_ALERT and activate heater when temp < 30°C', async () => {
      mockShedRepo.findOne.mockResolvedValue(null);

      const shed = await service.recordBrooderTelemetry({
        shedCode: 'SHED-COLD-01',
        temperatureCelsius: 27.5,
        relativeHumidityPercent: 58.0,
        ammoniaPpm: 10.0,
      });

      expect(shed.alarmStatus).toBe(BrooderShedAlarmStatus.TEMPERATURE_COLD_CHILLING_ALERT);
      expect(shed.brooderHeaterState).toBe('HEATING');
      expect(shed.alarmMessage).toContain('শীতল ব্রুডার সতর্কতা');
    });

    it('should retain OPTIMAL_BROODING_ENVIRONMENT when within normal ranges', async () => {
      mockShedRepo.findOne.mockResolvedValue(null);

      const shed = await service.recordBrooderTelemetry({
        shedCode: 'SHED-OPT-01',
        temperatureCelsius: 33.5,
        relativeHumidityPercent: 60.0,
        ammoniaPpm: 12.0,
      });

      expect(shed.alarmStatus).toBe(BrooderShedAlarmStatus.OPTIMAL_BROODING_ENVIRONMENT);
      expect(shed.alarmMessage).toBeNull();
    });
  });

  describe('Batch & Egg Lot Management', () => {
    it('should create a DOC hatchery batch with biosecurity metadata', async () => {
      const batch = await service.createBatch({
        hatcheryName: 'নরসিংদী সোনালী এগ্রো',
        breederPhone: '01799887766',
        district: 'নরসিংদী',
        breedType: PoultryBreedType.SONALI_CLASSIC,
        flockStage: HatcheryFlockStage.DAY_OLD_CHICK_DOC,
        hatchDate: '2026-10-17',
        chickCount: 4000,
        averageWeightGrams: 41.5,
        vaccinationStatus: VaccinationStatus.MAREKS_DAY_1_CERTIFIED,
        unitPriceBdt: 40.0,
        isBiosecureCertified: true,
      });

      expect(batch.id).toBe('batch-mock-uuid');
      expect(batch.batchCode).toContain('DOC-');
      expect(mockBatchRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when batch is not found', async () => {
      mockBatchRepo.findOne.mockResolvedValue(null);
      await expect(service.getBatchById('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should create table egg lot with automatic weight grading', async () => {
      const lot = await service.createEggLot({
        farmName: 'বগুড়া মডেল লেয়ার ফার্ম',
        district: 'বগুড়া',
        collectionDate: '2026-10-17',
        totalEggsCount: 10800,
        averageEggWeightGrams: 67.0,
        pricePerHundredBdt: 1250,
        availableCasesCount: 30,
      });

      expect(lot.id).toBe('egg-mock-uuid');
      expect(lot.eggGrade).toBe(EggQualityGrade.GRADE_AA_JUMBO_OVER_65G);
      expect(mockEggRepo.save).toHaveBeenCalled();
    });
  });
});
