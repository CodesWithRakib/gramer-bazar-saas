import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrchardAuctionService } from './orchard-auction.service.js';
import { OrchardTreeAuctionLot } from './entities/orchard-tree-auction-lot.entity.js';
import { PhytosanitaryHwtBatch } from './entities/phytosanitary-hwt-batch.entity.js';
import { OrchardHarvestDispatch } from './entities/orchard-harvest-dispatch.entity.js';
import {
  FruitType,
  OrchardRegion,
  FruitCultivar,
  FruitBaggingStatus,
  OrchardAuctionStatus,
  HwtTreatmentStatus,
  ChemicalMrlStatus,
  ColdChainTransitStatus,
  PackagingType,
  DispatchGradingQuality,
} from './enums/orchard-auction.enum.js';

describe('OrchardAuctionService', () => {
  let service: OrchardAuctionService;
  let lotRepo: any;
  let hwtRepo: any;
  let dispatchRepo: any;

  beforeEach(async () => {
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

    hwtRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'mock-hwt-id', ...dto })),
      save: vi.fn((entity) => Promise.resolve(entity)),
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      })),
    };

    dispatchRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'mock-disp-id', ...dto })),
      save: vi.fn((entity) => Promise.resolve(entity)),
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrchardAuctionService,
        {
          provide: getRepositoryToken(OrchardTreeAuctionLot),
          useValue: lotRepo,
        },
        {
          provide: getRepositoryToken(PhytosanitaryHwtBatch),
          useValue: hwtRepo,
        },
        {
          provide: getRepositoryToken(OrchardHarvestDispatch),
          useValue: dispatchRepo,
        },
      ],
    }).compile();

    service = module.get<OrchardAuctionService>(OrchardAuctionService);
  });

  describe('calculateOrchardValuation', () => {
    it('should calculate valuation for GI certified Khirsapat mango with fruit bagging bonus', () => {
      const result = service.calculateOrchardValuation({
        fruitType: FruitType.MANGO,
        cultivar: FruitCultivar.KHIRSAPAT_HIMSAGAR,
        treeCount: 100,
        averageYieldKgPerTree: 100,
        floweringFruitSetPct: 80.0,
        fruitBaggingStatus: FruitBaggingStatus.BAG_PROTECTED,
        isGiCertified: true,
      });

      // 100 * 100 * (80/80) * 1.15 = 11,500 kg
      expect(result.effectiveYieldKg).toBe(11500);
      expect(result.basePricePerKg).toBe(120);
      // 120 * 1.20 (GI bonus) = 144 BDT/kg
      expect(result.effectivePricePerKg).toBe(144);
      // 11,500 * 144 = 1,656,000 BDT
      expect(result.recommendedReservePriceBdt).toBe(1656000);
      expect(result.escrowPaymentSchedule.tranche1SigningBdt).toBe(
        Math.round(1656000 * 0.3),
      );
      expect(result.escrowPaymentSchedule.tranche2BaggingBdt).toBe(
        Math.round(1656000 * 0.4),
      );
      expect(result.escrowPaymentSchedule.tranche3HarvestBdt).toBe(
        Math.round(1656000 * 0.3),
      );
      expect(result.exportReadinessNote).toContain('UK/EU MRL');
    });

    it('should calculate valuation for Dinajpur Bedana litchi with conventional unbagged status', () => {
      const result = service.calculateOrchardValuation({
        fruitType: FruitType.LITCHI,
        cultivar: FruitCultivar.DINAJPUR_BEDANA_LITCHI,
        treeCount: 50,
        averageYieldKgPerTree: 60,
        floweringFruitSetPct: 80.0,
        fruitBaggingStatus: FruitBaggingStatus.CONVENTIONAL_UNBAGGED,
        isGiCertified: false,
      });

      // 50 * 60 = 3000 kg
      expect(result.effectiveYieldKg).toBe(3000);
      expect(result.basePricePerKg).toBe(280);
      expect(result.recommendedReservePriceBdt).toBe(3000 * 280);
    });
  });

  describe('evaluateHwtQuarantine', () => {
    it('should pass phytosanitary quarantine when water is 48°C for 60 min and MRL is safe', () => {
      const result = service.evaluateHwtQuarantine({
        fruitType: FruitType.MANGO,
        waterTempCelsius: 48.0,
        immersionDurationMinutes: 60,
        fruitCoreTempCelsius: 46.8,
        chemicalMrlPpm: 0.02,
        transitTempCelsius: 11.0,
        transitHumidityPct: 88.0,
      });

      expect(result.hwtVerdict).toBe('HWT_OPTIMAL_PHYTO_PASSED');
      expect(result.isMrlSafe).toBe(true);
      expect(result.coldChainStatus).toBe(ColdChainTransitStatus.OPTIMAL_CHILLED);
      expect(result.exportApproved).toBe(true);
    });

    it('should alert on underheated water (< 47.0°C) with quarantine larvae survival risk', () => {
      const result = service.evaluateHwtQuarantine({
        fruitType: FruitType.MANGO,
        waterTempCelsius: 46.5,
        immersionDurationMinutes: 60,
        fruitCoreTempCelsius: 45.0,
        chemicalMrlPpm: 0.02,
        transitTempCelsius: 11.0,
        transitHumidityPct: 88.0,
      });

      expect(result.hwtVerdict).toBe('HWT_UNDERHEATED_QUARANTINE_RISK');
      expect(result.exportApproved).toBe(false);
    });

    it('should alert on overheated water (> 48.8°C) with scalding and pulp cooking risk', () => {
      const result = service.evaluateHwtQuarantine({
        fruitType: FruitType.MANGO,
        waterTempCelsius: 49.5,
        immersionDurationMinutes: 60,
        fruitCoreTempCelsius: 48.2,
        chemicalMrlPpm: 0.02,
        transitTempCelsius: 11.0,
        transitHumidityPct: 88.0,
      });

      expect(result.hwtVerdict).toBe('HWT_OVERHEATED_SCALDING_RISK');
      expect(result.exportApproved).toBe(false);
    });

    it('should alert on cold-chain chilling injury when mango transit temp < 8.0°C', () => {
      const result = service.evaluateHwtQuarantine({
        fruitType: FruitType.MANGO,
        waterTempCelsius: 48.0,
        immersionDurationMinutes: 60,
        fruitCoreTempCelsius: 46.8,
        chemicalMrlPpm: 0.02,
        transitTempCelsius: 6.0,
        transitHumidityPct: 88.0,
      });

      expect(result.coldChainStatus).toBe(
        ColdChainTransitStatus.TEMPERATURE_SPIKE_ALERT,
      );
      expect(result.coldChainNotes).toContain('Chilling injury warning');
      expect(result.exportApproved).toBe(false);
    });

    it('should alert on litchi pericarp browning when transit temperature exceeds 5.5°C', () => {
      const result = service.evaluateHwtQuarantine({
        fruitType: FruitType.LITCHI,
        waterTempCelsius: 48.0,
        immersionDurationMinutes: 60,
        fruitCoreTempCelsius: 46.8,
        chemicalMrlPpm: 0.02,
        transitTempCelsius: 7.5,
        transitHumidityPct: 90.0,
      });

      expect(result.coldChainStatus).toBe(ColdChainTransitStatus.WARMING_RISK);
      expect(result.coldChainNotes).toContain('Pericarp browning risk');
      expect(result.exportApproved).toBe(false);
    });
  });

  describe('placeOrchardBid', () => {
    it('should place bid successfully when increment is at least 5000 BDT', async () => {
      const mockLot = {
        id: 'lot-1',
        status: OrchardAuctionStatus.AUCTION_OPEN,
        currentHighestBidBdt: 500000,
        advanceEscrowPct: 30.0,
        bids: [],
      };
      lotRepo.findOne.mockResolvedValue(mockLot);

      const result = await service.placeOrchardBid('lot-1', {
        bidderName: 'Dhaka Premium Fruits',
        bidderPhone: '+8801812345678',
        bidAmountBdt: 510000,
      });

      expect(result.currentHighestBidBdt).toBe(510000);
      expect(result.highestBidderBrokerName).toBe('Dhaka Premium Fruits');
      expect(result.advanceEscrowPaidBdt).toBe(Math.round(510000 * 0.3));
      expect(result.bids).toHaveLength(1);
    });

    it('should throw BadRequestException if bid is below minimum required increment', async () => {
      const mockLot = {
        id: 'lot-1',
        status: OrchardAuctionStatus.AUCTION_OPEN,
        currentHighestBidBdt: 500000,
        advanceEscrowPct: 30.0,
        bids: [],
      };
      lotRepo.findOne.mockResolvedValue(mockLot);

      await expect(
        service.placeOrchardBid('lot-1', {
          bidderName: 'Underbidder',
          bidderPhone: '+8801812345678',
          bidAmountBdt: 502000,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createHwtBatch', () => {
    it('should generate phytosanitary certificate when HWT parameters are compliant', async () => {
      hwtRepo.count.mockResolvedValue(41);

      const result = await service.createHwtBatch({
        orchardName: 'Padma Valley Orchard',
        fruitType: FruitType.MANGO,
        cultivar: FruitCultivar.KHIRSAPAT_HIMSAGAR,
        totalFreshWeightKg: 2000,
        cratesCount: 100,
        hwtFacilityLocation: 'Central Packing House, Shyampur',
        waterTempCelsius: 48.0,
        immersionDurationMinutes: 60,
        fruitCoreTempCelsius: 46.8,
        hydrocoolingTempCelsius: 26.0,
        chemicalMrlStatus: ChemicalMrlStatus.TEST_PASSED_MRL_SAFE,
        pesticideMrlPpm: 0.02,
        inspectorName: 'Dr. Nazmul',
        inspectorDesignation: 'Inspector',
      });

      expect(result.batchNumber).toBe(`HWT-${new Date().getFullYear()}-DAE-0042`);
      expect(result.quarantinePassIssued).toBe(true);
      expect(result.phytosanitaryCertificateNumber).toContain('DAE/PQW-');
      expect(result.status).toBe(HwtTreatmentStatus.QUARANTINE_CERTIFIED_EXPORT);
    });
  });

  describe('dispatches and cold chain', () => {
    it('should create and update cold-chain dispatch record', async () => {
      dispatchRepo.count.mockResolvedValue(87);

      const created = await service.createDispatch({
        fruitType: FruitType.MANGO,
        cultivar: FruitCultivar.KHIRSAPAT_HIMSAGAR,
        dispatchWeightKg: 2000,
        cratesCount: 400,
        packagingType: PackagingType.CORRUGATED_5KG_VENTILATED,
        brixSugarDegree: 18.5,
        gradingQuality: DispatchGradingQuality.EXPORT_GRADE_SUPERIOR,
        reeferVanPlateNumber: 'DHAKA-METRO-11-2233',
        reeferSetpointCelsius: 11.0,
        currentTransitTempCelsius: 11.2,
        currentTransitHumidityPct: 88.0,
        originHub: 'Shibganj Hub',
        destinationMarket: 'DAC Airport',
      });

      expect(created.dispatchCode).toBe(
        `DISP-${new Date().getFullYear()}-REEF-088`,
      );
      expect(created.coldChainStatus).toBe(
        ColdChainTransitStatus.OPTIMAL_CHILLED,
      );

      dispatchRepo.findOne.mockResolvedValue(created);

      const updated = await service.updateDispatchColdChain('mock-disp-id', {
        currentTransitTempCelsius: 15.5,
        currentTransitHumidityPct: 85.0,
      });

      expect(updated.coldChainStatus).toBe(ColdChainTransitStatus.WARMING_RISK);
    });
  });
});
