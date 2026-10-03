import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MedicineBatchesService } from './medicine-batches.service.js';
import { BatchStatus } from '../../enums/medicine-batch-status.enum.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MedicineBatchesService', () => {
  let service: MedicineBatchesService;
  let batchesRepo: any;
  let variantsRepo: any;

  beforeEach(() => {
    batchesRepo = {
      create: vi.fn((data) => ({ id: 'batch-1', ...data })),
      save: vi.fn((entity) => Promise.resolve(entity)),
      findOne: vi.fn(),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: vi.fn(() => ({
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([
          {
            id: 'batch-1',
            batchNumber: 'PARA-001',
            expiryDate: '2027-12-31',
            quantity: 100,
            status: BatchStatus.ACTIVE,
          },
        ]),
      })),
    };

    variantsRepo = {
      findOne: vi.fn().mockResolvedValue({ id: 'var-1', nameEn: '500mg Strip' }),
    };

    service = new MedicineBatchesService(batchesRepo, variantsRepo);
  });

  it('creates an active batch for existing variant', async () => {
    batchesRepo.findOne.mockResolvedValue(null);
    const batch = await service.create({
      productVariantId: 'var-1',
      batchNumber: 'PARA-001',
      expiryDate: '2028-01-01',
      quantity: 50,
    });
    expect(batch.status).toBe(BatchStatus.ACTIVE);
    expect(batch.batchNumber).toBe('PARA-001');
    expect(batchesRepo.save).toHaveBeenCalled();
  });

  it('rejects batch creation when variant is missing', async () => {
    variantsRepo.findOne.mockResolvedValue(null);
    await expect(
      service.create({
        productVariantId: 'missing-var',
        batchNumber: 'PARA-001',
        expiryDate: '2028-01-01',
        quantity: 50,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('marks batch as EXPIRED when expiry date is in the past', async () => {
    batchesRepo.findOne.mockResolvedValue(null);
    const batch = await service.create({
      productVariantId: 'var-1',
      batchNumber: 'OLD-001',
      expiryDate: '2020-01-01',
      quantity: 10,
    });
    expect(batch.status).toBe(BatchStatus.EXPIRED);
  });

  it('finds batches ordered by expiry date', async () => {
    const list = await service.findAll();
    expect(list).toHaveLength(1);
    expect(list[0].batchNumber).toBe('PARA-001');
  });

  it('throws NotFoundException on missing batch', async () => {
    batchesRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });
});
