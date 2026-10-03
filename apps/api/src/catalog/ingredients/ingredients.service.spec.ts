import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IngredientsService } from './ingredients.service.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('IngredientsService', () => {
  let service: IngredientsService;
  let ingredientsRepo: any;
  let productIngredientsRepo: any;

  beforeEach(() => {
    ingredientsRepo = {
      create: vi.fn((data) => ({ id: 'ing-1', ...data })),
      save: vi.fn((entity) => Promise.resolve(entity)),
      findOne: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: vi.fn(() => ({
        orderBy: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(0),
        getMany: vi.fn().mockResolvedValue([
          { id: 'ing-1', nameEn: 'Paracetamol', nameBn: 'প্যারাসিটামল', slug: 'paracetamol' },
        ]),
      })),
    };

    productIngredientsRepo = {
      count: vi.fn().mockResolvedValue(0),
    };

    service = new IngredientsService(ingredientsRepo, productIngredientsRepo);
  });

  it('creates an ingredient with slugified name', async () => {
    const res = await service.create({
      nameEn: 'Paracetamol',
      nameBn: 'প্যারাসিটামল',
      isPrescriptionOnly: false,
    });
    expect(res.slug).toBe('paracetamol');
    expect(ingredientsRepo.save).toHaveBeenCalled();
  });

  it('finds all ingredients', async () => {
    const list = await service.findAll();
    expect(list).toHaveLength(1);
    expect(list[0].nameEn).toBe('Paracetamol');
  });

  it('throws NotFoundException on missing ingredient', async () => {
    ingredientsRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('blocks deletion when referenced in products', async () => {
    ingredientsRepo.findOne.mockResolvedValue({ id: 'ing-1' });
    productIngredientsRepo.count.mockResolvedValue(2);
    await expect(service.remove('ing-1')).rejects.toThrow(BadRequestException);
  });
});
