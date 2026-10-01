import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SellerPortalService } from './seller-portal.service.js';
import { SellerAnalyticsService } from './seller-analytics.service.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from '../orders/entities/order-item.entity.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import { PayoutRequest } from '../payouts/entities/payout-request.entity.js';

import { Delivery } from '../deliveries/entities/delivery.entity.js';
import { User } from '../users/entities/user.entity.js';
import { OrdersService } from '../orders/orders.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';

describe('SellerPortalService', () => {
  let service: SellerPortalService;
  const shopRepository = { findOne: vi.fn(), update: vi.fn() };
  const analyticsService = { getAnalytics: vi.fn() };
  const dataSource = { query: vi.fn() };
  const deliveryRepository = { findOne: vi.fn() };
  const userRepository = { findOne: vi.fn(), save: vi.fn() };
  const ordersService = { transitionOrder: vi.fn() };
  const auditLogsService = { record: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerPortalService,
        { provide: getRepositoryToken(Shop), useValue: shopRepository },
        { provide: getRepositoryToken(Order), useValue: {} },
        { provide: getRepositoryToken(OrderItem), useValue: {} },
        { provide: getRepositoryToken(Wallet), useValue: { findOne: vi.fn() } },
        {
          provide: getRepositoryToken(PayoutRequest),
          useValue: { createQueryBuilder: vi.fn() },
        },
        { provide: getRepositoryToken(Delivery), useValue: deliveryRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: OrdersService, useValue: ordersService },
        { provide: AuditLogsService, useValue: auditLogsService },
        { provide: SellerAnalyticsService, useValue: analyticsService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<SellerPortalService>(SellerPortalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('throws when the authenticated seller has no shop', async () => {
    shopRepository.findOne.mockResolvedValue(null);

    await expect(service.getShopForSeller('seller-1')).rejects.toThrow(
      'Shop not found for this seller',
    );
  });

  it('resolves the shop owned by the seller', async () => {
    shopRepository.findOne.mockResolvedValue({ id: 'shop-1', sellerId: 'seller-1' });

    await expect(service.getShopForSeller('seller-1')).resolves.toEqual({
      id: 'shop-1',
      sellerId: 'seller-1',
    });
    expect(shopRepository.findOne).toHaveBeenCalledWith({ where: { sellerId: 'seller-1' } });
  });

  it('never clears unrelated shop columns on a partial update', async () => {
    shopRepository.findOne.mockResolvedValue({
      id: 'shop-1',
      sellerId: 'seller-1',
      isActive: true,
    });
    shopRepository.update.mockResolvedValue({ affected: 1 });
    dataSource.query.mockResolvedValue([{ product_count: 0, total_orders: 0 }]);

    await service.updateShopProfile('seller-1', { nameEn: 'New Name' } as never);

    expect(shopRepository.update).toHaveBeenCalledWith('shop-1', { nameEn: 'New Name' });
  });

  it('skips the write entirely when nothing was provided', async () => {
    shopRepository.findOne.mockResolvedValue({
      id: 'shop-1',
      sellerId: 'seller-1',
      isActive: true,
    });

    await service.updateShopProfile('seller-1', {} as never);

    expect(shopRepository.update).not.toHaveBeenCalled();
  });

  it('rejects access when shop is suspended and assertActive is true', async () => {
    shopRepository.findOne.mockResolvedValue({
      id: 'shop-1',
      sellerId: 'seller-1',
      isActive: false,
    });

    await expect(service.getShopForSeller('seller-1', true)).rejects.toThrow(
      'Your shop has been deactivated or suspended by platform administration.',
    );
  });

  it('updates seller avatar and writes audit log', async () => {
    const user = { id: 'seller-1', firstName: 'Rahim', lastName: 'Mia', avatar: null };
    userRepository.findOne.mockResolvedValue(user);
    userRepository.save.mockResolvedValue({ ...user, avatar: 'https://example.com/avatar.webp' });

    const result = await service.updateSellerAvatar('seller-1', 'https://example.com/avatar.webp');

    expect(result.avatar).toBe('https://example.com/avatar.webp');
    expect(userRepository.save).toHaveBeenCalled();
    expect(auditLogsService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'SELLER_AVATAR_UPDATED',
        actorId: 'seller-1',
      }),
    );
  });
});
