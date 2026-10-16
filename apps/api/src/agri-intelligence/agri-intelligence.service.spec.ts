import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgriIntelligenceService } from './agri-intelligence.service.js';
import { MandiTrendDirection } from './entities/mandi-price.entity.js';

describe('AgriIntelligenceService', () => {
  let service: AgriIntelligenceService;
  let mandiRepo: any;

  beforeEach(() => {
    mandiRepo = {
      count: vi.fn(),
      create: vi.fn((dto) => ({ id: 'mandi-1', ...dto })),
      save: vi.fn(async (entity) => entity),
      createQueryBuilder: vi.fn(() => ({
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        addOrderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
        getOne: vi.fn().mockResolvedValue(null),
      })),
    };

    service = new AgriIntelligenceService(mandiRepo);
  });

  describe('seedBaselineMandiPrices', () => {
    it('seeds baseline records when database is empty', async () => {
      mandiRepo.count.mockResolvedValue(0);

      await service.seedBaselineMandiPrices();

      expect(mandiRepo.create).toHaveBeenCalled();
      expect(mandiRepo.save).toHaveBeenCalled();
    });

    it('skips seeding when records already exist', async () => {
      mandiRepo.count.mockResolvedValue(15);

      await service.seedBaselineMandiPrices();

      expect(mandiRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('getFairPriceAdvisory', () => {
    const mockMandiRecord = {
      id: 'mandi-1',
      cropName: 'Miniket Rice',
      cropNameBn: 'মিনিকেট চাল',
      commodityGroup: 'CEREALS',
      division: 'Rajshahi',
      district: 'Bogra',
      marketName: 'Bogra Mohasthangarh Hat',
      minPrice: 68.0,
      maxPrice: 74.0,
      modalPrice: 70.0,
      priceUnit: 'kg',
      trendDirection: MandiTrendDirection.STABLE,
      recordedDate: '2026-10-16',
    };

    it('returns FAIR_MARKET when price is within 10% of modal price', async () => {
      const qb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(mockMandiRecord),
      };
      mandiRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getFairPriceAdvisory({
        cropName: 'Miniket Rice',
        district: 'Bogra',
        offeredPrice: 72.0,
      });

      expect(result.pricingStatus).toBe('FAIR_MARKET');
      expect(result.benchmarkModalPrice).toBe(70.0);
      expect(result.deviationPercentage).toBeGreaterThanOrEqual(0);
      expect(result.adviceEn).toContain('aligns with prevailing wholesale');
    });

    it('returns BELOW_MARKET when price is more than 10% below modal price', async () => {
      const qb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(mockMandiRecord),
      };
      mandiRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getFairPriceAdvisory({
        cropName: 'Miniket Rice',
        district: 'Bogra',
        offeredPrice: 55.0,
      });

      expect(result.pricingStatus).toBe('BELOW_MARKET');
      expect(result.deviationPercentage).toBeLessThan(-10);
      expect(result.adviceEn).toContain('below prevailing mandi rates');
    });

    it('returns ABOVE_MARKET when price is more than 10% above modal price', async () => {
      const qb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(mockMandiRecord),
      };
      mandiRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getFairPriceAdvisory({
        cropName: 'Miniket Rice',
        district: 'Bogra',
        offeredPrice: 85.0,
      });

      expect(result.pricingStatus).toBe('ABOVE_MARKET');
      expect(result.deviationPercentage).toBeGreaterThan(10);
      expect(result.adviceEn).toContain('above wholesale rates');
    });

    it('provides safe advisory fallback when no mandi record matches', async () => {
      const qb = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(null),
      };
      mandiRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getFairPriceAdvisory({
        cropName: 'Exotic Dragonfruit',
        offeredPrice: 350.0,
      });

      expect(result.pricingStatus).toBe('FAIR_MARKET');
      expect(result.adviceEn).toContain('No historical mandi record found');
      expect(result.adviceBn).toContain('এই পণ্যের সুনির্দিষ্ট পাইকারি রেকর্ড পাওয়া যায়নি');
    });
  });

  describe('recordMandiPrice', () => {
    it('creates and saves new mandi spot price record', async () => {
      const dto = {
        cropName: 'Deshi Potato',
        cropNameBn: 'দেশি আলু',
        commodityGroup: 'VEGETABLES',
        division: 'Rangpur',
        district: 'Rangpur',
        marketName: 'Rangpur City Hat',
        minPrice: 25.0,
        maxPrice: 30.0,
        modalPrice: 28.0,
        priceUnit: 'kg',
        recordedDate: '2026-10-16',
      };

      const result = await service.recordMandiPrice(dto as any);

      expect(result.cropName).toBe('Deshi Potato');
      expect(mandiRepo.save).toHaveBeenCalled();
    });
  });
});
