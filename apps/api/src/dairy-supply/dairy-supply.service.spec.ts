import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DairySupplyService } from './dairy-supply.service.js';
import {
  MilkType,
  MilkShift,
  MilkQualityGrade,
  ChillingVatStatus,
  FeedCategory,
  PaymentSettlementStatus,
} from './enums/dairy-supply.enum.js';

describe('DairySupplyService', () => {
  let service: DairySupplyService;
  let mockCollectionRepo: any;
  let mockVatRepo: any;
  let mockFeedPoolRepo: any;

  beforeEach(() => {
    mockCollectionRepo = {
      count: vi.fn().mockResolvedValue(1),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'mlk-entry-1', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: entity.id || 'mlk-entry-1', ...entity })),
    };

    mockVatRepo = {
      count: vi.fn().mockResolvedValue(1),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'vat-1', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: entity.id || 'vat-1', ...entity })),
    };

    mockFeedPoolRepo = {
      count: vi.fn().mockResolvedValue(1),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'pool-1', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: entity.id || 'pool-1', ...entity })),
    };

    service = new DairySupplyService(
      mockCollectionRepo,
      mockVatRepo,
      mockFeedPoolRepo,
    );
  });

  describe('Richmond SNF & Milk Pricing Calculator', () => {
    it('should accurately calculate SNF% and milk rate using Richmond formula for Cow milk', () => {
      // CLR = 29.5, Fat = 4.3%
      // SNF = (29.5 / 4) + (0.2 * 4.3) + 0.36 = 7.375 + 0.86 + 0.36 = 8.595 (~8.60%)
      const result = service.calculateMilkRate({
        fatPercentage: 4.3,
        lactometerReadingCorrected: 29.5,
        milkType: MilkType.COW_MILK,
        volumeLiters: 20,
      });

      expect(result.calculatedSnfPercentage).toBeCloseTo(8.6, 1);
      expect(result.qualityGrade).toBe(MilkQualityGrade.GRADE_A_PREMIUM_CHILLED);
      expect(result.ratePerLiterBdt).toBeGreaterThan(65.0); // Baseline 65 + bonuses
      expect(result.totalPayoutAmountBdt).toBeCloseTo(result.ratePerLiterBdt * 20, 1);
    });

    it('should detect water dilution when CLR is under 26 and apply penalty', () => {
      const result = service.calculateMilkRate({
        fatPercentage: 3.0,
        lactometerReadingCorrected: 24.0, // Water diluted
        milkType: MilkType.COW_MILK,
        volumeLiters: 15,
      });

      expect(result.qualityGrade).toBe(MilkQualityGrade.GRADE_C_SUBSTANDARD);
      expect(result.adulterationWarning).toContain('Water Dilution');
    });

    it('should accurately price high-fat Buffalo milk based on buffalo standards', () => {
      const result = service.calculateMilkRate({
        fatPercentage: 7.0,
        lactometerReadingCorrected: 31.0,
        milkType: MilkType.BUFFALO_MILK,
        volumeLiters: 25,
      });

      expect(result.baseRatePerLiterBdt).toBe(85.0);
      expect(result.ratePerLiterBdt).toBeGreaterThan(90.0);
      expect(result.qualityGrade).toBe(MilkQualityGrade.GRADE_A_PREMIUM_CHILLED);
    });
  });

  describe('Livestock Feed Bulk Savings Calculator', () => {
    it('should compute monthly feed group-buy savings for a 5-cow herd', () => {
      const result = service.calculateFeedSavings({
        feedCategory: FeedCategory.MUSTARD_OIL_CAKE,
        herdCowsCount: 5,
        monthlyConsumptionKgPerCow: 90, // 450 kg total
      });

      expect(result.totalMonthlyVolumeKg).toBe(450);
      expect(result.retailPricePerKgBdt).toBe(48.0);
      expect(result.pooledPricePerKgBdt).toBe(37.5);
      expect(result.netMonthlySavingsBdt).toBe(450 * (48.0 - 37.5)); // ৳4,725
      expect(result.savingsPercentage).toBeGreaterThan(20);
    });
  });

  describe('Bulk Milk Cooler (BMC) IoT Telemetry', () => {
    it('should trigger high temperature alarm when vat temperature exceeds 7.0°C', async () => {
      const mockVat = {
        id: 'vat-bag-1',
        vatCode: 'BMC-BAG-01',
        currentVolumeLiters: 4000,
        currentTemperatureCelsius: 3.8,
        vatStatus: ChillingVatStatus.OPTIMAL_CHILLED_4C,
        isAlarmActive: false,
        alarmReason: null,
      };
      mockVatRepo.findOne.mockResolvedValue(mockVat);

      const updated = await service.recordChillingTelemetry({
        vatCode: 'BMC-BAG-01',
        currentVolumeLiters: 4200,
        currentTemperatureCelsius: 8.5, // High temp anomaly
      });

      expect(updated.vatStatus).toBe(ChillingVatStatus.TEMPERATURE_ALARM_HIGH);
      expect(updated.isAlarmActive).toBe(true);
      expect(updated.alarmReason).toContain('8.5°C');
    });
  });

  describe('Milk Collection Ledger & Payout', () => {
    it('should create milk collection intake and disburse payment to farmer wallet', async () => {
      const entry = await service.createCollectionEntry('farmer-1', {
        farmerName: 'রহিম',
        farmerPhone: '01711223344',
        cooperativeCenterId: 'center-1',
        cooperativeName: 'বাঘাবাড়ি চিলিং হাব',
        milkType: MilkType.COW_MILK,
        collectionShift: MilkShift.MORNING_SHIFT,
        volumeLiters: 20,
        lactometerReadingCorrected: 29.5,
        fatPercentage: 4.2,
        collectionDate: '2026-10-17',
      });

      expect(entry.id).toBeDefined();
      expect(entry.ratePerLiterBdt).toBeGreaterThan(65);
      expect(entry.paymentStatus).toBe(PaymentSettlementStatus.PAYMENT_PENDING);

      mockCollectionRepo.findOne.mockResolvedValue(entry);
      const disbursed = await service.disbursePayment(entry.id);
      expect(disbursed.paymentStatus).toBe(PaymentSettlementStatus.DISBURSED_MFS_WALLET);
    });
  });

  describe('Livestock Feed Group Buy Pooling', () => {
    it('should join feed pool and automatically close when target volume is reached', async () => {
      const mockPool = {
        id: 'pool-1',
        poolCode: 'FEED-POOL-01',
        targetVolumeKg: 1000,
        committedVolumeKg: 800,
        currentParticipantsCount: 4,
        isClosedAndOrdered: false,
      };
      mockFeedPoolRepo.findOne.mockResolvedValue(mockPool);

      const updated = await service.joinFeedPool({
        poolId: 'pool-1',
        orderedKg: 250, // Exceeds target 1000
      });

      expect(updated.committedVolumeKg).toBe(1050);
      expect(updated.currentParticipantsCount).toBe(5);
      expect(updated.isClosedAndOrdered).toBe(true);
    });
  });
});
