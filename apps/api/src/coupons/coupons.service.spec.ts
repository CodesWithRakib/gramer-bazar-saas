import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Coupon } from './entities/coupon.entity.js';
import { CouponUsage } from './entities/coupon-usage.entity.js';
import { DiscountType } from './enums/discount-type.enum.js';
import { CouponsService } from './coupons.service.js';

describe('CouponsService.validateCoupon', () => {
  let service: CouponsService;

  const couponRepository = { findOne: vi.fn() };
  const couponUsageRepository = { count: vi.fn() };
  const dataSource = { transaction: vi.fn() };

  const makeCoupon = (overrides: Record<string, unknown> = {}) => ({
    id: 'c1',
    code: 'SAVE10',
    isActive: true,
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10,
    usedCount: 0,
    usageLimit: null,
    customerUsageLimit: 3,
    minOrderAmount: null,
    maxDiscountAmount: null,
    startDate: null,
    endDate: null,
    ...overrides,
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    couponUsageRepository.count.mockResolvedValue(0);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        { provide: getRepositoryToken(Coupon), useValue: couponRepository },
        { provide: getRepositoryToken(CouponUsage), useValue: couponUsageRepository },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
  });

  it('computes a percentage discount', async () => {
    couponRepository.findOne.mockResolvedValue(makeCoupon());

    await expect(service.validateCoupon('save10', 'u1', 200)).resolves.toEqual({
      couponId: 'c1',
      code: 'SAVE10',
      discountAmount: 20,
      subtotalAfterDiscount: 180,
    });
  });

  it('caps a percentage discount at maxDiscountAmount', async () => {
    couponRepository.findOne.mockResolvedValue(
      makeCoupon({ discountValue: 50, maxDiscountAmount: 30 }),
    );

    const result = await service.validateCoupon('save10', 'u1', 200);

    expect(result.discountAmount).toBe(30);
  });

  it('computes a fixed discount without exceeding the subtotal', async () => {
    couponRepository.findOne.mockResolvedValue(
      makeCoupon({ discountType: DiscountType.FIXED, discountValue: 500 }),
    );

    const result = await service.validateCoupon('save10', 'u1', 100);

    expect(result.discountAmount).toBe(100);
    expect(result.subtotalAfterDiscount).toBe(0);
  });

  it('rejects an unknown code', async () => {
    couponRepository.findOne.mockResolvedValue(null);

    await expect(service.validateCoupon('nope', 'u1', 100)).rejects.toThrow(
      /Invalid coupon code/,
    );
  });

  it.each([
    ['inactive', { isActive: false }, /currently inactive/],
    ['not started', { startDate: new Date('2100-01-01') }, /not active yet/],
    ['expired', { endDate: new Date('2000-01-01') }, /expired/],
    ['global limit reached', { usageLimit: 5, usedCount: 5 }, /usage limit/],
    ['minimum order not met', { minOrderAmount: 500 }, /Minimum order amount/],
  ])('rejects a coupon that is %s', async (_label, overrides, matcher) => {
    couponRepository.findOne.mockResolvedValue(makeCoupon(overrides));

    await expect(service.validateCoupon('SAVE10', 'u1', 100)).rejects.toThrow(
      matcher as RegExp,
    );
  });

  it('rejects when the customer already used all their redemptions', async () => {
    couponRepository.findOne.mockResolvedValue(makeCoupon());
    couponUsageRepository.count.mockResolvedValue(3);

    await expect(service.validateCoupon('SAVE10', 'u1', 100)).rejects.toThrow(
      /maximum usage limit/,
    );
  });
});
