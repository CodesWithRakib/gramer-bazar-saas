import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { JuteBiotechService } from './jute-biotech.service.js';
import {
  JuteVariety,
  JuteFiberGrade,
  RettingMethod,
  RettingStatus,
  BaleType,
  PackagingActCategory,
  BalingEscrowStatus,
} from './enums/jute-biotech.enum.js';

describe('JuteBiotechService', () => {
  let service: JuteBiotechService;
  let mockRettingRepo: any;
  let mockLotRepo: any;
  let mockContractRepo: any;

  beforeEach(() => {
    mockRettingRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'retting-mock-uuid', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: 'retting-mock-uuid', ...entity })),
    };

    mockLotRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'lot-mock-uuid', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: 'lot-mock-uuid', ...entity })),
    };

    mockContractRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'contract-mock-uuid', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: 'contract-mock-uuid', ...entity })),
    };

    service = new JuteBiotechService(mockRettingRepo, mockLotRepo, mockContractRepo);
  });

  describe('Moisture Weight & Farmgate Escrow Calculator', () => {
    it('should award 1.5% dryness bonus for fiber with moisture < 12%', () => {
      const result = service.calculateMoistureDeduction({
        grossWeightKg: 2050,
        tareWeightKg: 50, // net 2000 kg = 50 maunds
        moisturePercentage: 11.5,
        basePricePerMaund: 4000,
        variety: JuteVariety.TOSSA_JUTE,
        grade: JuteFiberGrade.BJC_SPECIAL_TOP,
      });

      expect(result.netRawWeightKg).toBe(2000);
      expect(result.moistureAdjustmentKg).toBe(0);
      expect(result.billableDryWeightKg).toBe(2000);
      expect(result.billableMaunds).toBe(50);
      expect(result.drynessBonusPercentage).toBe(1.5);
      expect(result.status).toBe('ACCEPTED_SAFE_MOISTURE');
      // 50 maunds * 4000 * 1.015 = 203,000
      expect(result.totalPayoutBdt).toBe(203000);
    });

    it('should apply pro-rata moisture deduction for moderately damp fiber (14.1% - 17%)', () => {
      const result = service.calculateMoistureDeduction({
        grossWeightKg: 1050,
        tareWeightKg: 50, // net 1000 kg
        moisturePercentage: 16.0, // 2% excess over 14%
        basePricePerMaund: 3500,
        variety: JuteVariety.TOSSA_JUTE,
        grade: JuteFiberGrade.BJD_GRADE_3,
      });

      expect(result.netRawWeightKg).toBe(1000);
      expect(result.moistureAdjustmentKg).toBe(20); // 1000 * 0.02
      expect(result.billableDryWeightKg).toBe(980);
      expect(result.billableMaunds).toBe(24.5); // 980 / 40
      expect(result.drynessBonusPercentage).toBe(0);
      expect(result.status).toBe('ACCEPTED_WITH_MOISTURE_DEDUCTION');
      expect(result.totalPayoutBdt).toBe(85750); // 24.5 * 3500
    });

    it('should apply 5% handling penalty for high moisture fiber (17.1% - 22%)', () => {
      const result = service.calculateMoistureDeduction({
        grossWeightKg: 1050,
        tareWeightKg: 50, // net 1000 kg
        moisturePercentage: 19.0, // 5% excess over 14% + 5% penalty = 10%
        basePricePerMaund: 3200,
        variety: JuteVariety.WHITE_JUTE,
        grade: JuteFiberGrade.BWD_GRADE_4,
      });

      expect(result.netRawWeightKg).toBe(1000);
      expect(result.moisturePenaltyPercentage).toBe(5.0);
      expect(result.moistureAdjustmentKg).toBe(100); // (0.05 + 0.05) * 1000
      expect(result.billableDryWeightKg).toBe(900);
      expect(result.billableMaunds).toBe(22.5);
      expect(result.status).toBe('HIGH_MOISTURE_PENALTY_APPLIED');
      expect(result.totalPayoutBdt).toBe(72000); // 22.5 * 3200
    });

    it('should reject fiber when moisture exceeds 22% safety threshold', () => {
      const result = service.calculateMoistureDeduction({
        grossWeightKg: 1050,
        tareWeightKg: 50,
        moisturePercentage: 24.5,
        basePricePerMaund: 3000,
      });

      expect(result.status).toBe('REJECTED_EXCESSIVE_WATERLOG_RISK');
      expect(result.billableDryWeightKg).toBe(0);
      expect(result.billableMaunds).toBe(0);
      expect(result.totalPayoutBdt).toBe(0);
      expect(result.recommendation).toContain('REJECTED: Moisture level');
    });
  });

  describe('Retting Pond & Biochemical Advisory Engine', () => {
    it('should detect ready fiber separation in ribbon retting at day 9 with optimal conditions', () => {
      const result = service.evaluateRettingPond({
        waterTempCelsius: 30.5,
        waterPh: 7.1,
        dissolvedOxygenMgL: 4.2,
        daysSteeping: 9,
        rettingMethod: RettingMethod.RIBBON_RETTING_ENZYMATIC,
      });

      expect(result.expectedTotalDays).toBe(10);
      expect(result.readinessScore).toBeGreaterThanOrEqual(85);
      expect(result.status).toBe(RettingStatus.FIBER_SEPARATION_READY);
      expect(result.fiberColorPrediction).toContain('Bright Silky Golden');
      expect(result.tensileStrengthForecast).toContain('High Tenacity');
    });

    it('should alert on anaerobic water stagnation causing Shyamla dark fiber', () => {
      const result = service.evaluateRettingPond({
        waterTempCelsius: 31.0,
        waterPh: 6.9,
        dissolvedOxygenMgL: 1.4, // Hypoxic
        daysSteeping: 5,
        rettingMethod: RettingMethod.CONVENTIONAL_WHOLE_PLANT_STEEP,
      });

      expect(result.fiberColorPrediction).toContain('Dark Greyish / Shyamla Risk');
      expect(result.alerts.some((a) => a.includes('Hypoxic'))).toBe(true);
    });

    it('should warn of over-retting hazard when steeping exceeds duration', () => {
      const result = service.evaluateRettingPond({
        waterTempCelsius: 32.0,
        waterPh: 7.0,
        dissolvedOxygenMgL: 3.8,
        daysSteeping: 13, // 13 days vs 10 days for ribbon
        rettingMethod: RettingMethod.RIBBON_RETTING_ENZYMATIC,
      });

      expect(result.status).toBe(RettingStatus.OVER_RETTED_RISK);
      expect(result.alerts.some((a) => a.includes('OVER-RETTING HAZARD'))).toBe(true);
    });
  });

  describe('CRUD & Overview Stats', () => {
    it('should calculate aggregated overview statistics', () => {
      mockRettingRepo.count.mockResolvedValueOnce(4).mockResolvedValueOnce(2).mockResolvedValueOnce(1);
      mockLotRepo.find.mockResolvedValueOnce([
        { baleCount: 20, billableMaunds: 68.75, totalPayoutBdt: 293025 },
        { baleCount: 15, billableMaunds: 51.46, totalPayoutBdt: 198121 },
      ]);
      mockContractRepo.find.mockResolvedValueOnce([
        { quantityMetricTonsOrBales: 120, totalContractValueBdt: 10560000 },
      ]);

      return service.getOverviewStats().then((stats) => {
        expect(stats.totalBatches).toBe(4);
        expect(stats.activeRettingBatches).toBe(2);
        expect(stats.readyBatches).toBe(1);
        expect(stats.totalBales).toBe(35);
        expect(stats.totalMaunds).toBe(120.21);
        expect(stats.totalFarmerPayoutBdt).toBe(491146);
        expect(stats.totalContractTonnage).toBe(120);
        expect(stats.totalContractValueBdt).toBe(10560000);
      });
    });

    it('should throw NotFoundException when retting batch is not found', async () => {
      mockRettingRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.getRettingBatchById('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should create a new fiber lot with computed moisture deductions', async () => {
      const lot = await service.createFiberLot({
        lotNumber: 'FBR-NEW-01',
        farmerName: 'Rahim Uddin',
        balingCenterName: 'Faridpur Co-op',
        district: 'Faridpur',
        variety: JuteVariety.TOSSA_JUTE,
        grade: JuteFiberGrade.BJC_SPECIAL_TOP,
        baleType: BaleType.KUTCHA_BALE_FARM,
        baleCount: 10,
        grossWeightKg: 1450,
        tareWeightKg: 50,
        moisturePercentage: 13.0,
        pricePerMaund: 4000,
      });

      expect(lot.id).toBe('lot-mock-uuid');
      expect(mockLotRepo.save).toHaveBeenCalled();
    });

    it('should create B2B contract with calculated total value', async () => {
      const contract = await service.createB2bContract({
        contractCode: 'B2B-NEW-99',
        buyerMillName: 'National Jute Mill',
        sellerCooperativeName: 'Faridpur Growers',
        mandatoryPackagingCategory: PackagingActCategory.PADDY_AND_RICE_50KG,
        productDescription: 'Food grain bags',
        quantityMetricTonsOrBales: 50,
        unitPriceBdt: 85000,
        deliveryDeadline: '2026-11-01',
      });

      expect(contract.id).toBe('contract-mock-uuid');
      expect(mockContractRepo.save).toHaveBeenCalled();
    });
  });
});
