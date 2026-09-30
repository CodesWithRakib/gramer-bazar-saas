import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import { Inventory } from '../entities/inventory.entity.js';
import { SellerProduct } from '../entities/seller-product.entity.js';
import { Role } from '../../roles/enums/role.enum.js';

describe('InventoryService tenant scoping', () => {
  let service: InventoryService;

  const inventoryRepository = {
    findOne: vi.fn(),
    save: vi.fn(async (entity: unknown) => entity),
    createQueryBuilder: vi.fn(),
    find: vi.fn(),
    create: vi.fn((x: unknown) => x),
  };
  const sellerProductRepository = { find: vi.fn(), findOne: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getRepositoryToken(Inventory), useValue: inventoryRepository },
        { provide: getRepositoryToken(SellerProduct), useValue: sellerProductRepository },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('allows the owning seller to update their own stock', async () => {
    inventoryRepository.findOne.mockResolvedValue({
      id: 'inv-1',
      quantity: 10,
      reservedQuantity: 0,
      sellerProduct: { id: 'sp-1', shop: { sellerId: 'seller-1' } },
    });

    await expect(
      service.update('inv-1', { quantity: 20 }, { id: 'seller-1', roles: [Role.SELLER] }),
    ).resolves.toMatchObject({ quantity: 20 });
  });

  it('rejects a seller mutating another shop’s inventory', async () => {
    inventoryRepository.findOne.mockResolvedValue({
      id: 'inv-1',
      quantity: 10,
      reservedQuantity: 0,
      sellerProduct: { id: 'sp-1', shop: { sellerId: 'seller-2' } },
    });

    await expect(
      service.update('inv-1', { quantity: 20 }, { id: 'seller-1', roles: [Role.SELLER] }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(inventoryRepository.save).not.toHaveBeenCalled();
  });

  it('lets admins update any inventory record', async () => {
    inventoryRepository.findOne.mockResolvedValue({
      id: 'inv-1',
      quantity: 10,
      reservedQuantity: 0,
      sellerProduct: { id: 'sp-1', shop: { sellerId: 'seller-2' } },
    });

    await expect(
      service.update('inv-1', { quantity: 3 }, { id: 'admin-1', roles: [Role.ADMIN] }),
    ).resolves.toMatchObject({ quantity: 3 });
  });

  it('blocks reducing stock below the reserved quantity', async () => {
    inventoryRepository.findOne.mockResolvedValue({
      id: 'inv-1',
      quantity: 10,
      reservedQuantity: 4,
      sellerProduct: { id: 'sp-1', shop: { sellerId: 'seller-1' } },
    });

    await expect(
      service.update('inv-1', { quantity: 1 }, { id: 'seller-1', roles: [Role.SELLER] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
