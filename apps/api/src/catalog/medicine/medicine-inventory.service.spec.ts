import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Repository } from 'typeorm';
import { MedicineInventoryService } from './medicine-inventory.service.js';
import { MedicineBatch } from '../entities/medicine-batch.entity.js';
import { BatchStatus } from '../enums/medicine-batch-status.enum.js';

const NOW = new Date('2026-10-03T10:00:00.000Z');

const makeBatch = (overrides: Partial<MedicineBatch> = {}): MedicineBatch =>
  ({
    id: 'batch-1',
    productVariantId: 'variant-1',
    batchNumber: 'B-1',
    manufacturingDate: null,
    expiryDate: '2027-01-01',
    quantity: 10,
    reservedQuantity: 0,
    supplier: null,
    purchaseCost: null,
    status: BatchStatus.ACTIVE,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  }) as MedicineBatch;

describe('MedicineInventoryService', () => {
  let repo: { find: ReturnType<typeof vi.fn>; createQueryBuilder: ReturnType<typeof vi.fn> };
  let service: MedicineInventoryService;

  beforeEach(() => {
    repo = { find: vi.fn(), createQueryBuilder: vi.fn() };
    service = new MedicineInventoryService(repo as unknown as Repository<MedicineBatch>);
  });

  describe('evaluateVariants', () => {
    it('ignores variants without batches so non-medicine verticals are unaffected', async () => {
      repo.find.mockResolvedValue([]);

      const result = await service.evaluateVariants(['electronics-variant'], NOW);

      expect(result.size).toBe(0);
      expect(result.has('electronics-variant')).toBe(false);
    });

    it('sums only active, unexpired, unreserved batches', async () => {
      repo.find.mockResolvedValue([
        makeBatch({ id: 'b1', expiryDate: '2027-05-01', quantity: 40, reservedQuantity: 5 }),
        makeBatch({ id: 'b2', expiryDate: '2028-02-01', quantity: 60 }),
        makeBatch({ id: 'b3', expiryDate: '2025-01-01', quantity: 100 }),
        makeBatch({
          id: 'b4',
          expiryDate: '2029-01-01',
          quantity: 25,
          status: BatchStatus.BLOCKED,
        }),
        makeBatch({
          id: 'b5',
          expiryDate: '2029-01-01',
          quantity: 25,
          status: BatchStatus.DEPLETED,
        }),
      ]);

      const availability = await service.evaluateVariants(['variant-1'], NOW);

      const info = availability.get('variant-1')!;
      expect(info.hasBatches).toBe(true);
      expect(info.available).toBe(95); // 35 + 60
      expect(info.isUnavailable).toBe(false);
      expect(info.nearestExpiry).toBe('2027-05-01');
    });

    it('marks a variant unavailable when every batch is expired or consumed', async () => {
      repo.find.mockResolvedValue([
        makeBatch({ id: 'b1', expiryDate: '2024-01-01', quantity: 100 }),
        makeBatch({
          id: 'b2',
          expiryDate: '2025-01-01',
          quantity: 50,
          status: BatchStatus.EXPIRED,
        }),
        makeBatch({ id: 'b3', expiryDate: '2028-01-01', quantity: 10, reservedQuantity: 10 }),
      ]);

      const info = (await service.evaluateVariants(['variant-1'], NOW)).get('variant-1')!;

      expect(info.available).toBe(0);
      expect(info.isUnavailable).toBe(true);
    });
  });

  describe('allocateFefo', () => {
    it('allocates across batches in earliest-expiry-first order', async () => {
      repo.find.mockResolvedValue([
        makeBatch({ id: 'early', expiryDate: '2027-01-01', quantity: 5 }),
        makeBatch({ id: 'late', expiryDate: '2028-01-01', quantity: 10 }),
      ]);

      const allocation = await service.allocateFefo('variant-1', 8, NOW);

      expect(allocation).toEqual([
        { batchId: 'early', take: 5 },
        { batchId: 'late', take: 3 },
      ]);
    });

    it('returns null when sellable stock cannot cover the quantity', async () => {
      repo.find.mockResolvedValue([
        makeBatch({ id: 'expired', expiryDate: '2024-01-01', quantity: 100 }),
        makeBatch({ id: 'active', expiryDate: '2028-01-01', quantity: 5 }),
      ]);

      await expect(service.allocateFefo('variant-1', 20, NOW)).resolves.toBeNull();
    });
  });
});
