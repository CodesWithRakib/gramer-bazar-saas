import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrdersService } from './orders.service.js';
import { PaymentsService } from '../payments/payments.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { Address } from '../addresses/entities/address.entity.js';
import { Coupon } from '../coupons/entities/coupon.entity.js';
import { User } from '../users/entities/user.entity.js';
import { OrderStatus, PaymentMethod } from './enums/order-status.enum.js';

describe('OrdersService', () => {
  let service: OrdersService;

  /** TypeORM transaction manager mock, matched by entity + criteria. */
  const manager = {
    findOne: vi.fn(),
    find: vi.fn(),
    count: vi.fn(),
    save: vi.fn(),
    insert: vi.fn(),
  };
  const dataSource = {
    transaction: vi.fn((cb: (m: unknown) => unknown) => cb(manager)),
    getRepository: vi.fn(() => ({
      find: vi.fn(),
      findOne: vi.fn(),
      createQueryBuilder: vi.fn(),
    })),
  };
  const paymentsService = { initPayment: vi.fn() };
  const notificationsService = { sendOrderConfirmationEmail: vi.fn() };

  const address = { id: 'addr-1', userId: 'user-1', streetAddress: 'Road 5' } as Address;
  const sellerProduct = (overrides: Record<string, unknown> = {}) => ({
    id: 'sp-1',
    price: 100,
    discountPrice: null,
    isActive: true,
    inventory: { sellerProductId: 'sp-1', quantity: 10, reservedQuantity: 0 },
    ...overrides,
  });
  const checkoutBase = {
    addressId: 'addr-1',
    paymentMethod: PaymentMethod.COD,
    items: [{ sellerProductId: 'sp-1', quantity: 2 }],
  };

  /**
   * The service looks entities up with `findOne({ where: { ... } })`. Match on
   * the entity class and whether the criteria targets the address/user/coupon,
   * so tests do not depend on call ordering.
   */
  const givenFindOne = (mappings: { match: (where: Record<string, unknown>) => boolean; value: unknown }[]) => {
    manager.findOne.mockImplementation(async (_entity, criteria) => {
      const where = (criteria?.where ?? {}) as Record<string, unknown>;
      const hit = mappings.find((m) => m.match(where));
      return hit ? hit.value : null;
    });
  };

  const isAddressLookup = (where: Record<string, unknown>) => 'id' in where && 'userId' in where;
  const isCouponLookup = (where: Record<string, unknown>) => 'code' in where;
  const isUserLookup = (where: Record<string, unknown>) => Object.keys(where).length === 1 && 'id' in where;

  const createService = async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: DataSource, useValue: dataSource },
        { provide: PaymentsService, useValue: paymentsService },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await createService();
  });

  describe('checkout', () => {
    it('creates a COD order, deducts stock and records history', async () => {
      const product = sellerProduct();
      givenFindOne([
        { match: isAddressLookup, value: address },
        { match: isUserLookup, value: { id: 'user-1', email: null } as User },
      ]);
      manager.find
        .mockResolvedValueOnce([product]) // seller products
        .mockResolvedValueOnce([product.inventory]); // inventories
      manager.save.mockImplementation(async (_entity, value) => value);
      manager.count.mockResolvedValue(0);

      const result = (await service.checkout('user-1', checkoutBase, 'http://localhost:3000')) as {
        order: { status: OrderStatus; total: number; subtotal: number; deliveryFee: number };
        paymentUrl: string | null;
      };

      expect(result.order.status).toBe(OrderStatus.PENDING);
      expect(result.order.subtotal).toBe(200);
      expect(result.order.deliveryFee).toBe(50);
      expect(result.order.total).toBe(250);
      expect(result.paymentUrl).toBeNull();
      // Stock deducted by the ordered quantity
      expect(product.inventory.quantity).toBe(8);
      expect(manager.save).toHaveBeenCalled();
      expect(notificationsService.sendOrderConfirmationEmail).not.toHaveBeenCalled();
    });

    it('rejects an address that does not belong to the buyer', async () => {
      givenFindOne([{ match: isAddressLookup, value: null }]);

      await expect(
        service.checkout('user-1', checkoutBase, 'http://x'),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects items whose product is missing or inactive', async () => {
      givenFindOne([{ match: isAddressLookup, value: address }]);
      manager.find.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      await expect(
        service.checkout('user-1', checkoutBase, 'http://x'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects orders exceeding available stock', async () => {
      givenFindOne([{ match: isAddressLookup, value: address }]);
      const product = sellerProduct();
      manager.find.mockResolvedValueOnce([product]).mockResolvedValueOnce([product.inventory]);

      await expect(
        service.checkout(
          'user-1',
          { ...checkoutBase, items: [{ sellerProductId: 'sp-1', quantity: 99 }] },
          'http://x',
        ),
      ).rejects.toThrow(/Insufficient stock/);
    });

    it('rejects an expired coupon', async () => {
      givenFindOne([
        { match: isAddressLookup, value: address },
        {
          match: isCouponLookup,
          value: {
            code: 'OLD10',
            isActive: true,
            endDate: new Date('2000-01-01'),
          } as Coupon,
        },
      ]);
      manager.find.mockResolvedValueOnce([sellerProduct()]).mockResolvedValueOnce([
        { sellerProductId: 'sp-1', quantity: 10 },
      ]);

      await expect(
        service.checkout('user-1', { ...checkoutBase, couponCode: 'OLD10' }, 'http://x'),
      ).rejects.toThrow(/expired/);
    });

    it('enforces the per-customer coupon usage limit', async () => {
      givenFindOne([
        { match: isAddressLookup, value: address },
        {
          match: isCouponLookup,
          value: {
            code: 'ONCE',
            isActive: true,
            endDate: new Date('2100-01-01'),
            discountType: 'PERCENTAGE',
            discountValue: 10,
            customerUsageLimit: 1,
          } as Coupon,
        },
      ]);
      manager.find.mockResolvedValueOnce([sellerProduct()]).mockResolvedValueOnce([
        { sellerProductId: 'sp-1', quantity: 10 },
      ]);
      manager.count.mockResolvedValue(1); // already used once

      await expect(
        service.checkout('user-1', { ...checkoutBase, couponCode: 'ONCE' }, 'http://x'),
      ).rejects.toThrow(/maximum usage limit/);
    });

    it('initiates an online payment for non-COD orders', async () => {
      givenFindOne([
        { match: isAddressLookup, value: address },
        { match: isUserLookup, value: { id: 'user-1', firstName: 'A', lastName: 'B' } as User },
      ]);
      manager.find.mockResolvedValueOnce([sellerProduct()]).mockResolvedValueOnce([
        { sellerProductId: 'sp-1', quantity: 10 },
      ]);
      manager.save.mockImplementation(async (_entity, value) => value);
      paymentsService.initPayment.mockResolvedValue('https://sslcommerz.test/pay');

      const result = (await service.checkout(
        'user-1',
        { ...checkoutBase, paymentMethod: PaymentMethod.ONLINE },
        'http://localhost:3000',
      )) as { paymentUrl: string | null };

      expect(paymentsService.initPayment).toHaveBeenCalledTimes(1);
      expect(result.paymentUrl).toBe('https://sslcommerz.test/pay');
    });
  });

  describe('cancelOrder', () => {
    it('cancels a pending order and restores inventory', async () => {
      const product = sellerProduct();
      const order = {
        id: 'o-1',
        userId: 'user-1',
        status: OrderStatus.PENDING,
        items: [{ sellerProductId: 'sp-1', quantity: 3 }],
      };
      manager.findOne.mockResolvedValueOnce(order);
      manager.find
        .mockImplementationOnce(async (_entity, criteria) => {
          // Sanity-check the service only touches its own items
          expect((criteria?.where as { id: string }).id).toBeDefined();
          return [product];
        });
      manager.save.mockImplementation(async (_entity, value) => value);

      const result = (await service.cancelOrder('user-1', 'o-1')) as {
        status: OrderStatus;
      };

      expect(result.status).toBe(OrderStatus.CANCELLED);
      // 10 + 3 restored = 13
      expect(product.inventory.quantity).toBe(13);
    });

    it('refuses to cancel a delivered order', async () => {
      manager.findOne.mockResolvedValueOnce({
        id: 'o-1',
        userId: 'user-1',
        status: OrderStatus.DELIVERED,
        items: [],
      });

      await expect(service.cancelOrder('user-1', 'o-1')).rejects.toThrow(
        /cannot be cancelled/i,
      );
    });

    it('throws when the order does not belong to the caller', async () => {
      manager.findOne.mockResolvedValueOnce(null);

      await expect(service.cancelOrder('user-1', 'nope')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('does not restore stock for items without inventory', async () => {
      const product = sellerProduct({ inventory: undefined });
      manager.findOne.mockResolvedValueOnce({
        id: 'o-1',
        userId: 'user-1',
        status: OrderStatus.CONFIRMED,
        items: [{ sellerProductId: 'sp-1', quantity: 3 }],
      });
      manager.find.mockResolvedValueOnce([product]);
      manager.save.mockImplementation(async (_entity, value) => value);

      const result = (await service.cancelOrder('user-1', 'o-1')) as {
        status: OrderStatus;
      };

      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(manager.save).toHaveBeenCalled();
    });
  });

});
