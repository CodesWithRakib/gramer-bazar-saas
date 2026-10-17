import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AquacultureService } from './aquaculture.service.js';
import {
  SpeciesName,
  PondWaterQualityStatus,
  PCRTestStatus,
  LiveFishTransportStatus,
  AquacultureCategory,
  HatcheryStage,
} from './enums/aquaculture.enum.js';

describe('AquacultureService', () => {
  let service: AquacultureService;
  let mockBatchRepo: any;
  let mockTelemetryRepo: any;
  let mockFcrRepo: any;
  let mockTankerRepo: any;

  beforeEach(() => {
    mockBatchRepo = {
      count: vi.fn().mockResolvedValue(3),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'mock-batch-uuid', ...dto })),
      save: vi.fn((entity) => Promise.resolve({ id: 'mock-batch-uuid', ...entity })),
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      })),
    };

    mockTelemetryRepo = {
      find: vi.fn().mockResolvedValue([]),
      create: vi.fn((dto) => ({ id: 'mock-telem-uuid', ...dto })),
      save: vi.fn((entity) => Promise.resolve({ id: 'mock-telem-uuid', ...entity })),
    };

    mockFcrRepo = {
      find: vi.fn().mockResolvedValue([]),
      create: vi.fn((dto) => ({ id: 'mock-fcr-uuid', ...dto })),
      save: vi.fn((entity) => Promise.resolve({ id: 'mock-fcr-uuid', ...entity })),
    };

    mockTankerRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'mock-tanker-uuid', ...dto })),
      save: vi.fn((entity) => Promise.resolve({ id: 'mock-tanker-uuid', ...entity })),
    };

    service = new AquacultureService(
      mockBatchRepo,
      mockTelemetryRepo,
      mockFcrRepo,
      mockTankerRepo,
    );
  });

  describe('evaluateWaterQuality', () => {
    it('should trigger HYPOXIA_CRITICAL and automatically activate aerators if DO < 4.0 mg/L', () => {
      const result = service.evaluateWaterQuality({
        pondId: 'pond-1',
        pondName: 'Satkhira Gher 01',
        dissolvedOxygenMgL: 3.2,
        waterTemperatureCelsius: 29.0,
        waterPh: 7.8,
        ammoniaNh3Ppm: 0.02,
      });

      expect(result.status).toBe(PondWaterQualityStatus.HYPOXIA_CRITICAL);
      expect(result.aeratorsActive).toBe(true);
      expect(result.alertMessageBn).toContain('মারাত্মক অক্সিজেন ঘাটতি');
    });

    it('should detect toxic ammonia spike if NH3 > 0.05 ppm and recommend water exchange', () => {
      const result = service.evaluateWaterQuality({
        pondId: 'pond-2',
        pondName: 'Biofloc Tank 02',
        dissolvedOxygenMgL: 6.5,
        waterTemperatureCelsius: 28.0,
        waterPh: 8.0,
        ammoniaNh3Ppm: 0.08,
      });

      expect(result.status).toBe(PondWaterQualityStatus.TOXIC_AMMONIA_SPIKE);
      expect(result.alertMessageBn).toContain('বিষাক্ত অ্যামোনিয়া');
      expect(result.actionProtocolBn[0]).toContain('পানি বের করে');
    });

    it('should report OPTIMAL when all parameters are balanced', () => {
      const result = service.evaluateWaterQuality({
        pondId: 'pond-3',
        pondName: 'Trishal Carp Pond',
        dissolvedOxygenMgL: 6.2,
        waterTemperatureCelsius: 28.5,
        waterPh: 7.6,
        ammoniaNh3Ppm: 0.01,
      });

      expect(result.status).toBe(PondWaterQualityStatus.OPTIMAL);
      expect(result.aeratorsActive).toBe(false);
    });
  });

  describe('calculateFcrAndEfficiency', () => {
    it('should compute exact FCR and benchmark comparison for Tilapia', () => {
      const result = service.calculateFcrAndEfficiency(1450, 1130, SpeciesName.MONOSEX_TILAPIA);
      expect(result.calculatedFcr).toBe(1.28);
      expect(result.benchmarkFcr).toBe(1.4);
      expect(result.rating).toBe('EXCELLENT');
      expect(result.feedSavingsBdt).toBeGreaterThan(0);
    });

    it('should identify feed waste when FCR is excessively high', () => {
      const result = service.calculateFcrAndEfficiency(2200, 1000, SpeciesName.MONOSEX_TILAPIA);
      expect(result.calculatedFcr).toBe(2.2);
      expect(result.rating).toBe('POOR_FEED_WASTE');
      expect(result.ratingDescriptionBn).toContain('উচ্চ এফসিআর');
    });
  });

  describe('calculateLiveFishMarketArbitrage', () => {
    it('should compute live fish wholesale price premium over iced dead fish', () => {
      const result = service.calculateLiveFishMarketArbitrage(SpeciesName.RUI_ROHU, 1000);
      expect(result.livePricePerKgBdt).toBe(380);
      expect(result.deadIcedPricePerKgBdt).toBe(270);
      expect(result.premiumPercentage).toBeCloseTo(40.7, 1);
      expect(result.netPremiumAdvantageBdt).toBe(110000); // 1000 * (380 - 270)
    });
  });

  describe('bookLiveFishTanker', () => {
    it('should record live tanker booking with calculated gross live revenue', async () => {
      const booking = await service.bookLiveFishTanker('buyer-1', {
        farmerId: 'farmer-1',
        pickupDistrict: 'Mymensingh',
        pickupUpazila: 'Trishal',
        pickupGherAddress: 'Trishal Aqua Farm',
        dropoffMarket: 'Karwan Bazar, Dhaka',
        species: SpeciesName.RUI_ROHU,
        approximateFishKg: 1000,
        transportFareBdt: 12000,
      });

      expect(booking.bookingNumber).toContain('LIVE-TANKER-');
      expect(booking.waterTankerStatus).toBe(LiveFishTransportStatus.REQUESTED);
      expect(booking.estimatedLivePriceBdt).toBe(380000);
    });
  });
});
