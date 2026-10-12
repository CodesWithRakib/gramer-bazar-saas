import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { vi } from 'vitest';
import { AnalyticsService } from './analytics.service.js';
import { DemandEvent } from './entities/demand-event.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { Product } from '../catalog/entities/product.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { SellerApplication } from '../applications/entities/seller-application.entity.js';
import { RiderApplication } from '../applications/entities/rider-application.entity.js';
import { PayoutRequest } from '../payouts/entities/payout-request.entity.js';
import { Dispute } from '../disputes/entities/dispute.entity.js';
import { ProductRequest } from '../product-requests/entities/product-request.entity.js';
import { Category } from '../catalog/entities/category.entity.js';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(Order), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Product), useValue: {} },
        { provide: getRepositoryToken(DemandEvent), useValue: {} },
        { provide: getRepositoryToken(Shop), useValue: {} },
        { provide: getRepositoryToken(SellerApplication), useValue: {} },
        { provide: getRepositoryToken(RiderApplication), useValue: {} },
        { provide: getRepositoryToken(PayoutRequest), useValue: {} },
        { provide: getRepositoryToken(Dispute), useValue: {} },
        { provide: getRepositoryToken(ProductRequest), useValue: {} },
        { provide: getRepositoryToken(Category), useValue: {} },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('generates seasonal demand forecast with agricultural projections', async () => {
    (service as any).demandEventRepository = {
      createQueryBuilder: vi.fn(() => ({
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(150),
      })),
    };

    const forecast = await service.getSeasonalDemandForecast('SUMMER');
    expect(forecast.activeSeason).toBe('SUMMER');
    expect(forecast.projectedSurgePercent).toBe(42);
    expect(forecast.commodities.length).toBeGreaterThan(0);
    expect(forecast.recentSearchVelocity).toBe(150);
  });

  it('generates regional demand breakdown grouped by division and district', async () => {
    (service as any).orderRepository = {
      createQueryBuilder: vi.fn(() => ({
        innerJoin: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        addGroupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        getRawMany: vi.fn().mockResolvedValue([
          {
            division: 'Rajshahi',
            district: 'Bogra',
            orderCount: '65',
            totalGmv: '135000',
            avgOrderValue: '2077',
          },
        ]),
      })),
    };

    const breakdown = await service.getRegionalDemandBreakdown();
    expect(breakdown.regions.length).toBe(1);
    expect(breakdown.regions[0].district).toBe('Bogra');
    expect(breakdown.regions[0].densityTier).toBe('HIGH_DENSITY');
    expect(breakdown.totalRegionalOrders).toBe(65);
  });
});
