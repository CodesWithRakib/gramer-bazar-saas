import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

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
import { SeederService } from './seeder.service.js';

const makeRepo = () => ({
  findOne: vi.fn(),
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
      ],
    }).compile();

    service = module.get<SeederService>(SeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates admin, customer, two sellers and two riders with hashed passwords', async () => {
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
    userRepo.save.mockImplementation(async (x) => x);

    const result = await service['seedUsersAndShops']();

    expect(userRepo.create).toHaveBeenCalledTimes(7);
    const created = userRepo.create.mock.calls.map((c) => c[0]) as Array<Record<string, unknown>>;

    expect(created[0]).toMatchObject({ email: 'superadmin@gramerbazar.com' });
    expect(created[1]).toMatchObject({ email: 'admin@gramerbazar.com' });
    expect(created[4]).toMatchObject({ email: 'seller2@gramerbazar.com' });
    expect(created[5]).toMatchObject({
      email: 'rider1@gramerbazar.com',
      firstName: 'Babul',
      roles: [{ id: 'r-rider', name: Role.RIDER }],
    });
    expect(created[6]).toMatchObject({
      email: 'rider2@gramerbazar.com',
      firstName: 'Kamal',
      roles: [{ id: 'r-rider', name: Role.RIDER }],
    });

    for (const u of created) {
      expect(u.status).toBe('ACTIVE');
      expect(u.isEmailVerified).toBe(true);
      expect(u.passwordHash).toBeDefined();
      expect(u.passwordHash).not.toBe('password123');
    }
    await expect(bcrypt.compare('password123', created[0].passwordHash as string)).resolves.toBe(true);

    expect(result.sellers).toHaveLength(2);
    expect(result.riders).toHaveLength(2);
  });

  it('creates one shop per seller', async () => {
    roleRepo.findOne.mockResolvedValue({ id: 'r', name: Role.SELLER });
    userRepo.save.mockImplementation(async (x) => x);
    shopRepo.save.mockImplementation(async (x) => x);

    await service['seedUsersAndShops']();

    expect(shopRepo.create).toHaveBeenCalledTimes(2);
    const shops = shopRepo.create.mock.calls.map((c) => c[0]) as Array<Record<string, unknown>>;
    expect(shops[0]).toMatchObject({ slug: 'rahim-traders' });
    expect(shops[1]).toMatchObject({ slug: 'karim-groceries' });
  });
});
