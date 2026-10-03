import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MedicineBatch } from '../entities/medicine-batch.entity.js';
import { BatchStatus } from '../enums/medicine-batch-status.enum.js';

export interface VariantAvailability {
  /** True when this variant is batch-tracked (medicine). */
  hasBatches: boolean;
  /** Sum of sellable (active, unexpired, unreserved) quantity across batches. */
  available: number;
  /** True when batch-tracked but no sellable batch remains (expired/consumed). */
  isUnavailable: boolean;
  /** Earliest usable expiry (FEFO order), or the earliest batch expiry if none usable. */
  nearestExpiry: string | null;
}

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

@Injectable()
export class MedicineInventoryService {
  constructor(
    @InjectRepository(MedicineBatch)
    private readonly batchRepo: Repository<MedicineBatch>,
  ) {}

  /**
   * Evaluate availability for a set of variants.
   *
   * Variants WITHOUT batches are intentionally absent from the result so callers
   * keep using the generic inventory quantity — this is what guarantees
   * Electronics and every future non-medicine vertical are unaffected.
   */
  async evaluateVariants(
    variantIds: string[],
    now: Date = new Date(),
  ): Promise<Map<string, VariantAvailability>> {
    const result = new Map<string, VariantAvailability>();
    const uniqueIds = Array.from(new Set(variantIds.filter(Boolean)));
    if (uniqueIds.length === 0) return result;

    const batches = await this.batchRepo.find({
      where: { productVariantId: In(uniqueIds) },
      order: { expiryDate: 'ASC' },
    });

    const byVariant = new Map<string, MedicineBatch[]>();
    for (const batch of batches) {
      const list = byVariant.get(batch.productVariantId);
      if (list) list.push(batch);
      else byVariant.set(batch.productVariantId, [batch]);
    }

    const today = startOfDay(now);
    for (const [variantId, list] of byVariant) {
      const usable = list.filter(
        (batch) =>
          batch.status === BatchStatus.ACTIVE &&
          new Date(batch.expiryDate) >= today &&
          batch.quantity - batch.reservedQuantity > 0,
      );
      const available = usable.reduce(
        (sum, batch) => sum + (batch.quantity - batch.reservedQuantity),
        0,
      );
      result.set(variantId, {
        hasBatches: true,
        available,
        isUnavailable: usable.length === 0,
        nearestExpiry: (usable[0] ?? list[0])?.expiryDate ?? null,
      });
    }
    return result;
  }

  /**
   * Allocate a quantity across batches using FEFO (First Expiry, First Out).
   * Returns the batch ids (in expiry order) that should fulfil the order, or
   * null when there is not enough sellable stock.
   */
  async allocateFefo(
    variantId: string,
    quantity: number,
    now: Date = new Date(),
  ): Promise<{ batchId: string; take: number }[] | null> {
    const batches = await this.batchRepo.find({
      where: { productVariantId: variantId },
      order: { expiryDate: 'ASC' },
    });
    const today = startOfDay(now);
    const usable = batches.filter(
      (batch) =>
        batch.status === BatchStatus.ACTIVE &&
        new Date(batch.expiryDate) >= today &&
        batch.quantity - batch.reservedQuantity > 0,
    );

    let remaining = quantity;
    const allocation: { batchId: string; take: number }[] = [];
    for (const batch of usable) {
      if (remaining <= 0) break;
      const free = batch.quantity - batch.reservedQuantity;
      const take = Math.min(free, remaining);
      if (take > 0) {
        allocation.push({ batchId: batch.id, take });
        remaining -= take;
      }
    }
    return remaining > 0 ? null : allocation;
  }

  /** Mark past-expiry batches as EXPIRED. Safe to call from a scheduled job. */
  async expireStaleBatches(now: Date = new Date()): Promise<number> {
    const result = await this.batchRepo
      .createQueryBuilder()
      .update(MedicineBatch)
      .set({ status: BatchStatus.EXPIRED })
      .where('status = :active', { active: BatchStatus.ACTIVE })
      .andWhere('expiry_date < :today', { today: startOfDay(now).toISOString().slice(0, 10) })
      .execute();
    return result.affected ?? 0;
  }
}
