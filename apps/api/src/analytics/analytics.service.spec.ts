import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
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
});
