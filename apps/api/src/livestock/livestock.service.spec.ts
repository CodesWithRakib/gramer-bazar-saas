import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LivestockService } from './livestock.service.js';
import {
  LivestockCategory,
  LivestockBreed,
  LivestockListingStatus,
  VeterinaryHealthStatus,
  LivestockEscrowStatus,
  VaccineType,
} from './enums/livestock.enum.js';
import { LivestockListing } from './entities/livestock-listing.entity.js';
import { LivestockHealthPassport } from './entities/livestock-health-passport.entity.js';

describe('LivestockService', () => {
  let service: LivestockService;
  let mockListingRepo: any;
  let mockPassportRepo: any;
  let mockAiBookingRepo: any;
  let mockTransportRepo: any;

  beforeEach(() => {
    mockListingRepo = {
      count: vi.fn().mockResolvedValue(4),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'mock-listing-uuid', ...dto })),
      save: vi.fn((entity) => Promise.resolve({ id: 'mock-listing-uuid', ...entity })),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      })),
    };

    mockPassportRepo = {
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'mock-passport-uuid', ...dto })),
      save: vi.fn((entity) => Promise.resolve({ id: 'mock-passport-uuid', ...entity })),
    };

    mockAiBookingRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'mock-ai-uuid', ...dto })),
      save: vi.fn((entity) => Promise.resolve({ id: 'mock-ai-uuid', ...entity })),
      count: vi.fn().mockResolvedValue(12),
    };

    mockTransportRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'mock-transport-uuid', ...dto })),
      save: vi.fn((entity) => Promise.resolve({ id: 'mock-transport-uuid', ...entity })),
      count: vi.fn().mockResolvedValue(3),
    };

    service = new LivestockService(
      mockListingRepo,
      mockPassportRepo,
      mockAiBookingRepo,
      mockTransportRepo,
    );
  });

  describe('estimateMeatYield', () => {
    it('should compute beef carcass and boneless meat based on 56% dressing percentage', () => {
      const result = service.estimateMeatYield(500, LivestockCategory.BEEF_CATTLE);
      expect(result.liveWeightKg).toBe(500);
      expect(result.dressingPercentage).toBe(56);
      expect(result.carcassWeightKg).toBe(280);
      expect(result.bonelessMeatKg).toBe(202); // 280 * 0.72 = 201.6 -> 202
      expect(result.estimatedMeatValueBdt).toBeGreaterThan(150000);
    });

    it('should compute goat carcass based on 50% dressing percentage and mutton rate', () => {
      const result = service.estimateMeatYield(30, LivestockCategory.GOAT);
      expect(result.liveWeightKg).toBe(30);
      expect(result.dressingPercentage).toBe(50);
      expect(result.carcassWeightKg).toBe(15);
      expect(result.bonelessMeatKg).toBe(11); // 15 * 0.72 = 10.8 -> 11
      expect(result.estimatedMeatValueBdt).toBe(11 * 1150);
    });
  });

  describe('validateQurbaniEligibility', () => {
    it('should approve adult cattle with 2+ teeth and certified healthy status', () => {
      const listing = {
        category: LivestockCategory.BEEF_CATTLE,
        teethCount: 2,
        ageMonths: 26,
        healthStatus: VeterinaryHealthStatus.CERTIFIED_HEALTHY,
      } as LivestockListing;

      const result = service.validateQurbaniEligibility(listing);
      expect(result.isCompliant).toBe(true);
      expect(result.reasonsBn.length).toBe(1);
    });

    it('should reject cattle with 0 permanent teeth or under 2 years of age', () => {
      const listing = {
        category: LivestockCategory.BEEF_CATTLE,
        teethCount: 0,
        ageMonths: 18,
        healthStatus: VeterinaryHealthStatus.CERTIFIED_HEALTHY,
      } as LivestockListing;

      const result = service.validateQurbaniEligibility(listing);
      expect(result.isCompliant).toBe(false);
      expect(result.reasonsBn[0]).toContain('ন্যূনতম ২ বছর');
    });
  });

  describe('calculateOptimalInseminationWindow', () => {
    it('should calculate 12-18 hour post-heat window using AM/PM rule', () => {
      const heatObs = '2026-10-17T06:00:00.000Z';
      const result = service.calculateOptimalInseminationWindow(heatObs);

      expect(result.ruleDescriptionBn).toContain('সকালে গরম লক্ষণ');
      expect(result.windowStart).toBeDefined();
      expect(result.windowEnd).toBeDefined();
    });
  });

  describe('commitEscrowPurchase & releaseEscrowToSeller', () => {
    it('should place listing under escrow and release to seller', async () => {
      const mockListing = {
        id: 'cow-101',
        earTagNumber: 'BAN-LIV-892101',
        sellerId: 'seller-1',
        sellerName: 'Faruk Dairy',
        askingPrice: 200000,
        listingStatus: LivestockListingStatus.AVAILABLE,
        escrowStatus: null,
      };
      mockListingRepo.findOne.mockResolvedValue({ ...mockListing });

      const escrowResult = await service.commitEscrowPurchase('cow-101', 'buyer-2', {
        buyerName: 'Karim',
        buyerPhone: '01700112233',
        escrowAmount: 200000,
      });

      expect(escrowResult.listingStatus).toBe(LivestockListingStatus.UNDER_ESCROW);
      expect(escrowResult.escrowStatus).toBe(LivestockEscrowStatus.HELD_IN_ESCROW);

      // Now release escrow
      mockListingRepo.findOne.mockResolvedValue({ ...escrowResult });
      const releaseResult = await service.releaseEscrowToSeller('cow-101', 'buyer-2');

      expect(releaseResult.escrowStatus).toBe(LivestockEscrowStatus.RELEASED_TO_SELLER);
      expect(releaseResult.listingStatus).toBe(LivestockListingStatus.SOLD);
    });
  });

  describe('addVaccineRecord', () => {
    it('should append new vaccine record into DLS passport ledger', async () => {
      const mockPassport = {
        id: 'pass-1',
        earTagNumber: 'BAN-LIV-892101',
        vaccinationLedger: [],
      };
      mockPassportRepo.findOne.mockResolvedValue(mockPassport);

      const updated = await service.addVaccineRecord('BAN-LIV-892101', {
        vaccine: VaccineType.FOOT_AND_MOUTH_FMD,
        doseDate: '2026-10-17',
        nextDueDate: '2027-04-17',
        batchNo: 'LRI-FMD-99',
        administeredBy: 'Dr. Nazmul Huda',
      });

      expect(updated.vaccinationLedger.length).toBe(1);
      expect(updated.vaccinationLedger[0].vaccine).toBe(VaccineType.FOOT_AND_MOUTH_FMD);
    });
  });
});
