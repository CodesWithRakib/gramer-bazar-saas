import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SellerPortalService } from './seller-portal.service.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from '../orders/entities/order-item.entity.js';

describe('SellerPortalService', () => {
  let service: SellerPortalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerPortalService,
        { provide: getRepositoryToken(Shop), useValue: {} },
        { provide: getRepositoryToken(SellerProduct), useValue: {} },
        { provide: getRepositoryToken(Inventory), useValue: {} },
        { provide: getRepositoryToken(Order), useValue: {} },
        { provide: getRepositoryToken(OrderItem), useValue: {} },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<SellerPortalService>(SellerPortalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
