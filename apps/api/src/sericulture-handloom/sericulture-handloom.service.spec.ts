import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SericultureHandloomService } from './sericulture-handloom.service.js';
import {
  SericultureCraftType,
  SilkGrade,
  YarnMaterial,
  AuthenticityStatus,
  WeavingLoomType,
  CocoonType,
  ArtisanOrderEscrowStatus,
} from './enums/sericulture-handloom.enum.js';

describe('SericultureHandloomService', () => {
  let service: SericultureHandloomService;
  let mockProductRepo: any;
  let mockCocoonRepo: any;
  let mockOrderRepo: any;

  beforeEach(() => {
    mockProductRepo = {
      count: vi.fn().mockResolvedValue(1),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'prod-123', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: entity.id || 'prod-123', ...entity })),
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([
          {
            id: 'prod-1',
            titleBn: 'রাজশাহী খাঁটি সিল্ক শাড়ি',
            craftType: SericultureCraftType.RAJSHAHI_MULBERRY_SILK,
            originDistrict: 'Rajshahi',
          },
        ]),
      })),
    };

    mockCocoonRepo = {
      count: vi.fn().mockResolvedValue(1),
      find: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation((dto) => ({ id: 'coc-123', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: entity.id || 'coc-123', ...entity })),
    };

    mockOrderRepo = {
      count: vi.fn().mockResolvedValue(1),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'ord-123', ...dto })),
      save: vi.fn().mockImplementation((entity) => Promise.resolve({ id: entity.id || 'ord-123', ...entity })),
    };

    service = new SericultureHandloomService(
      mockProductRepo,
      mockCocoonRepo,
      mockOrderRepo,
    );
  });

  describe('Cocoon Reeling & Renditta Calculations', () => {
    it('should accurately compute renditta ratio and raw silk yield for Bivoltine cocoons', () => {
      const result = service.calculateCocoonReeling({
        freshCocoonWeightKg: 100,
        cocoonType: CocoonType.BIVOLTINE,
        shellRatioPercentage: 22.0,
      });

      expect(result.freshCocoonWeightKg).toBe(100);
      expect(result.rendittaRatio).toBeCloseTo(8.18, 1);
      expect(result.estimatedRawSilkFilamentKg).toBeGreaterThan(11);
      expect(result.netValueAddedBdt).toBeGreaterThan(0);
      expect(result.valueAdditionPercentage).toBeGreaterThan(0);
      expect(result.chrysalisPupaeByProductKg).toBe(62);
    });
  });

  describe('Fair-Wage Cost Breakdown Matrix', () => {
    it('should compute fair weaver wages and show positive benefit increase over middleman dadan', () => {
      const result = service.calculateFairWage({
        craftType: SericultureCraftType.NARAYANGANJ_DHAKAI_JAMDANI,
        weavingDays: 20,
        zariType: 'PURE_SILVER_ZARI',
      });

      expect(result.weavingDays).toBe(20);
      expect(result.totalArtisanWageBdt).toBe(20 * 850); // ৳17,000
      expect(result.fairTransparentRetailPriceBdt).toBeGreaterThan(result.netProductionCostBdt);
      expect(result.directBenefitIncreasePercentage).toBeGreaterThan(100); // 850 vs 300 is +183%
    });
  });

  describe('Catalog & Products', () => {
    it('should filter products by craft type and origin district', async () => {
      const products = await service.getCatalog({
        craftType: SericultureCraftType.RAJSHAHI_MULBERRY_SILK,
        originDistrict: 'Rajshahi',
      });

      expect(products).toHaveLength(1);
      expect(products[0].craftType).toBe(SericultureCraftType.RAJSHAHI_MULBERRY_SILK);
    });

    it('should save a new handloom product with GI certificate', async () => {
      const saved = await service.createProduct('artisan-1', 'করিম তাঁতি', {
        craftType: SericultureCraftType.TANGAIL_HANDLOOM_TAANT,
        titleBn: 'টাঙ্গাইল সুতি তাঁত শাড়ি',
        titleEn: 'Tangail Cotton Saree',
        originDistrict: 'Tangail',
        weavingVillage: 'Pathrail',
        loomType: WeavingLoomType.TRADITIONAL_PIT_LOOM,
        yarnMaterial: YarnMaterial.GASSED_MERCERIZED_COTTON,
        threadCountWarp: 80,
        threadCountWeft: 80,
        silkGrade: SilkGrade.GRADE_B_DOMESTIC_STANDARD,
        authenticityStatus: AuthenticityStatus.GI_REGISTERED_ORIGIN,
        giCertificateNumber: 'GI-BD-TANGAIL-004',
        weavingDurationDays: 4,
        artisanWageBdt: 3200,
        priceBdt: 5500,
      });

      expect(saved.id).toBeDefined();
      expect(saved.artisanId).toBe('artisan-1');
      expect(saved.giCertificateNumber).toBe('GI-BD-TANGAIL-004');
    });
  });

  describe('Sericulture Cocoon Batches', () => {
    it('should register a new cocoon batch with BSDB inspection', async () => {
      const batch = await service.createCocoonBatch('farmer-1', {
        farmerName: 'রফিকুল ইসলাম',
        farmingDistrict: 'Bholahat, Chapainawabganj',
        mulberryVariety: 'BM-4',
        cocoonType: CocoonType.BIVOLTINE,
        freshCocoonWeightKg: 85,
        pricePerKgBdt: 680,
        harvestDate: '2026-10-15',
      });

      expect(batch.id).toBeDefined();
      expect(batch.freshCocoonWeightKg).toBe(85);
      expect(batch.lotNumber).toContain('BSDB-LOT-');
    });
  });

  describe('Custom Commissions & Escrow Lifecycle', () => {
    it('should lock 50% upfront escrow advance when placing custom order', async () => {
      const order = await service.createCustomOrder(
        'buyer-1',
        'ফারহানা',
        '01711223344',
        {
          artisanId: 'artisan-2',
          artisanName: 'মোবারক হোসেন',
          craftType: SericultureCraftType.NARAYANGANJ_DHAKAI_JAMDANI,
          customMotifDescription: 'নীল জমিনে রূপালী ময়ূরপঙ্খী বুটা',
          agreedPriceBdt: 40000,
          estimatedDeliveryDays: 25,
        },
      );

      expect(order.agreedPriceBdt).toBe(40000);
      expect(order.advanceEscrowBdt).toBe(20000); // 50%
      expect(order.orderStatus).toBe(ArtisanOrderEscrowStatus.ORDER_PLACED_ESCROW_LOCKED);
    });

    it('should update weaving progress and settle escrow upon delivery', async () => {
      const mockOrder = {
        id: 'ord-123',
        orderNumber: 'HND-ORD-091',
        artisanName: 'মোবারক হোসেন',
        agreedPriceBdt: 30000,
        orderStatus: ArtisanOrderEscrowStatus.IN_WEAVING_PROGRESS,
        weftProgressPercentage: 40,
        inspectionNotes: null,
      };
      mockOrderRepo.findOne.mockResolvedValue(mockOrder);

      const updated = await service.updateLoomProgress('ord-123', {
        orderStatus: ArtisanOrderEscrowStatus.FINISHED_BOARD_INSPECTED,
        weftProgressPercentage: 100,
        inspectionNotes: 'বুনন নিখুঁত সম্পন্ন।',
      });

      expect(updated.orderStatus).toBe(ArtisanOrderEscrowStatus.FINISHED_BOARD_INSPECTED);
      expect(updated.weftProgressPercentage).toBe(100);

      const settled = await service.settleCustomOrder('ord-123');
      expect(settled.orderStatus).toBe(ArtisanOrderEscrowStatus.ESCROW_RELEASED_TO_WEAVER);
    });
  });
});
