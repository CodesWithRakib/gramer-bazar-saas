import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { User } from '../users/entities/user.entity.js';
import { RoleEntity } from '../roles/entities/role.entity.js';
import { Role } from '../roles/enums/role.enum.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { Category } from '../catalog/entities/category.entity.js';
import { Brand } from '../catalog/entities/brand.entity.js';
import { Product } from '../catalog/entities/product.entity.js';
import { ProductVariant } from '../catalog/entities/product-variant.entity.js';
import { ProductImage } from '../catalog/entities/product-image.entity.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';
import { Review } from '../reviews/entities/review.entity.js';
import { Country } from '../locations/entities/country.entity.js';
import { Division } from '../locations/entities/division.entity.js';
import { District } from '../locations/entities/district.entity.js';
import { Upazila } from '../locations/entities/upazila.entity.js';
import { Union } from '../locations/entities/union.entity.js';
import { Area } from '../locations/entities/area.entity.js';
import { Banner } from '../banners/entities/banner.entity.js';
import { FlashSale } from '../flash-sales/entities/flash-sale.entity.js';
import { FlashSaleItem } from '../flash-sales/entities/flash-sale-item.entity.js';
import { Address } from '../addresses/entities/address.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from '../orders/entities/order-item.entity.js';
import { OrderStatusHistory } from '../orders/entities/order-status-history.entity.js';
import { Payment } from '../payments/entities/payment.entity.js';
import { Delivery } from '../deliveries/entities/delivery.entity.js';
import { DeliveryHistory } from '../deliveries/entities/delivery-history.entity.js';
import { WishlistItem } from '../wishlists/entities/wishlist-item.entity.js';
import { Coupon } from '../coupons/entities/coupon.entity.js';
import { Notification } from '../notifications/entities/notification.entity.js';
import { Conversation } from '../chat/entities/conversation.entity.js';
import { Message } from '../chat/entities/message.entity.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import { WalletTransaction } from '../wallets/entities/wallet-transaction.entity.js';
import { DemandEvent } from '../analytics/entities/demand-event.entity.js';
import { SeederService } from './seeder.service.js';

const makeRepo = () => ({
  findOne: vi.fn(),
  find: vi.fn().mockResolvedValue([]),
  count: vi.fn().mockResolvedValue(0),
  create: vi.fn((x: unknown) => x),
  save: vi.fn(async (x: unknown) => x),
});

describe('SeederService - seedUsersAndShops', () => {
  let service: SeederService;

  const userRepo = makeRepo();
  const roleRepo = makeRepo();
  const shopRepo = makeRepo();

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederService,
        { provide: DataSource, useValue: { synchronize: vi.fn() } },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(RoleEntity), useValue: roleRepo },
        { provide: getRepositoryToken(Shop), useValue: shopRepo },
        { provide: getRepositoryToken(Category), useValue: makeRepo() },
        { provide: getRepositoryToken(Brand), useValue: makeRepo() },
        { provide: getRepositoryToken(Product), useValue: makeRepo() },
        { provide: getRepositoryToken(ProductVariant), useValue: makeRepo() },
        { provide: getRepositoryToken(ProductImage), useValue: makeRepo() },
        { provide: getRepositoryToken(SellerProduct), useValue: makeRepo() },
        { provide: getRepositoryToken(Inventory), useValue: makeRepo() },
        { provide: getRepositoryToken(Review), useValue: makeRepo() },
        { provide: getRepositoryToken(Country), useValue: makeRepo() },
        { provide: getRepositoryToken(Division), useValue: makeRepo() },
        { provide: getRepositoryToken(District), useValue: makeRepo() },
        { provide: getRepositoryToken(Upazila), useValue: makeRepo() },
        { provide: getRepositoryToken(Union), useValue: makeRepo() },
        { provide: getRepositoryToken(Area), useValue: makeRepo() },
        { provide: getRepositoryToken(Banner), useValue: makeRepo() },
        { provide: getRepositoryToken(FlashSale), useValue: makeRepo() },
        { provide: getRepositoryToken(FlashSaleItem), useValue: makeRepo() },
        { provide: getRepositoryToken(Address), useValue: makeRepo() },
        { provide: getRepositoryToken(Order), useValue: makeRepo() },
        { provide: getRepositoryToken(OrderItem), useValue: makeRepo() },
        { provide: getRepositoryToken(OrderStatusHistory), useValue: makeRepo() },
        { provide: getRepositoryToken(Payment), useValue: makeRepo() },
        { provide: getRepositoryToken(Delivery), useValue: makeRepo() },
        { provide: getRepositoryToken(DeliveryHistory), useValue: makeRepo() },
        { provide: getRepositoryToken(WishlistItem), useValue: makeRepo() },
        { provide: getRepositoryToken(Coupon), useValue: makeRepo() },
        { provide: getRepositoryToken(Notification), useValue: makeRepo() },
        { provide: getRepositoryToken(Conversation), useValue: makeRepo() },
        { provide: getRepositoryToken(Message), useValue: makeRepo() },
        { provide: getRepositoryToken(Wallet), useValue: makeRepo() },
        { provide: getRepositoryToken(WalletTransaction), useValue: makeRepo() },
        { provide: getRepositoryToken(DemandEvent), useValue: makeRepo() },
      ],
    }).compile();

    service = module.get<SeederService>(SeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates admins, customers, sellers and riders with hashed passwords', async () => {
    roleRepo.findOne.mockImplementation(async ({ where }) => {
      switch (where?.name) {
        case Role.SUPER_ADMIN:
          return { id: 'r-super', name: Role.SUPER_ADMIN };
        case Role.ADMIN:
          return { id: 'r-admin', name: Role.ADMIN };
        case Role.CUSTOMER:
          return { id: 'r-cust', name: Role.CUSTOMER };
        case Role.SELLER:
          return { id: 'r-seller', name: Role.SELLER };
        case Role.RIDER:
          return { id: 'r-rider', name: Role.RIDER };
        default:
          return null;
      }
    });
    userRepo.findOne.mockResolvedValue(null);
    userRepo.save.mockImplementation(async (x) => x);
    shopRepo.findOne.mockResolvedValue(null);
    shopRepo.save.mockImplementation(async (x) => x);

    const result = await service['seedUsersAndShops']();

    expect(userRepo.create).toHaveBeenCalled();
    const created = userRepo.create.mock.calls.map((c) => c[0]) as Array<Record<string, unknown>>;

    // Check key accounts
    const adminUser = created.find((u) => u.email === 'admin@gramerbazar.example');
    expect(adminUser).toBeDefined();
    expect(adminUser?.status).toBe('ACTIVE');
    expect(adminUser?.isEmailVerified).toBe(true);

    const shopOwner = created.find((u) => u.email === 'shop1@gramerbazar.example');
    expect(shopOwner).toBeDefined();

    const customerUser = created.find((u) => u.email === 'customer1@gramerbazar.example');
    expect(customerUser).toBeDefined();

    const riderUser = created.find((u) => u.email === 'rider1@gramerbazar.com');
    expect(riderUser).toBeDefined();

    for (const u of created) {
      expect(u.status).toBe('ACTIVE');
      expect(u.isEmailVerified).toBe(true);
      expect(u.passwordHash).toBeDefined();
    }

    expect(result.sellers.length).toBeGreaterThanOrEqual(15);
    expect(result.riders.length).toBeGreaterThanOrEqual(6);
  });

  it('creates authentic shops for sellers', async () => {
    roleRepo.findOne.mockResolvedValue({ id: 'r', name: Role.SELLER });
    userRepo.findOne.mockResolvedValue(null);
    userRepo.save.mockImplementation(async (x) => x);
    shopRepo.findOne.mockResolvedValue(null);
    shopRepo.save.mockImplementation(async (x) => x);

    await service['seedUsersAndShops']();

    expect(shopRepo.create).toHaveBeenCalled();
    const shops = shopRepo.create.mock.calls.map((c) => c[0]) as Array<Record<string, unknown>>;
    expect(shops.length).toBeGreaterThanOrEqual(15);
    expect(shops.some((s) => s.slug === 'rahim-traders')).toBe(true);
    expect(shops.some((s) => s.slug === 'karim-groceries')).toBe(true);
  });
});
