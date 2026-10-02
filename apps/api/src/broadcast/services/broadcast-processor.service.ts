import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';

import { Broadcast } from '../entities/broadcast.entity.js';
import { BroadcastRecipient } from '../entities/broadcast-recipient.entity.js';
import {
  BroadcastProviderMessageStatus,
  BroadcastRecipientStatus,
  BroadcastStatus,
} from '../enums/broadcast.enums.js';
import { BroadcastProviderRegistry } from '../providers/broadcast-provider.registry.js';
import { BroadcastCampaignsService } from './broadcast-campaigns.service.js';
import type { BroadcastSendResult } from '../providers/broadcast-provider.interface.js';

const DEFAULT_BATCH_SIZE = 20;
const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 30_000;
const RETRY_MAX_DELAY_MS = 5 * 60_000;
const STALE_SENDING_MS = 2 * 60_000;
const TICK_INTERVAL_MS = 5_000;

/**
 * Background processing for broadcast campaigns.
 *
 * IMPORTANT: This is a lightweight, in-process worker driven by a timer. It is
 * deliberately provider-agnostic and queue-agnostic so it can later be replaced
 * by a Redis/BullMQ worker WITHOUT changing any business logic:
 *   - `processScheduledCampaigns()` → a scheduled job
 *   - `processQueuedRecipients()`   → a queue consumer
 *   - `advanceSimulatedReceipts()`  → mock-only; a real provider's webhooks
 *     replace this entirely (see docs/broadcast/WHATSAPP_INTEGRATION.md).
 *
 * The timer approach assumes a single API instance processing the queue. When
 * horizontally scaled, swap the timer for the shared queue so recipients are
 * claimed exactly once.
 */
@Injectable()
export class BroadcastProcessorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BroadcastProcessorService.name);
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    @InjectRepository(Broadcast)
    private readonly broadcastRepo: Repository<Broadcast>,
    @InjectRepository(BroadcastRecipient)
    private readonly recipientRepo: Repository<BroadcastRecipient>,
    private readonly campaignsService: BroadcastCampaignsService,
    private readonly providerRegistry: BroadcastProviderRegistry,
  ) {}

  onModuleInit(): void {
    // Skip the timer in tests; tests invoke the granular methods directly.
    if (process.env.NODE_ENV === 'test' || process.env.DISABLE_BROADCAST_WORKER === 'true') {
      return;
    }
    this.timer = setInterval(() => {
      void this.tick();
    }, TICK_INTERVAL_MS);
    // Do not keep the Node process alive just for the worker.
    this.timer.unref?.();
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** One processing pass. Safe to call concurrently — overlapping runs are skipped. */
  async tick(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      await this.processScheduledCampaigns();
      await this.processQueuedRecipients();
      await this.advanceSimulatedReceipts();
      await this.finalizeCompletedCampaigns();
    } catch (error) {
      this.logger.error('Broadcast worker tick failed', error as Error);
    } finally {
      this.isRunning = false;
    }
  }

  /** Promote due SCHEDULED campaigns to PROCESSING (resolve audience + queue). */
  async processScheduledCampaigns(): Promise<number> {
    const due = await this.broadcastRepo.find({
      where: { status: BroadcastStatus.SCHEDULED, scheduledAt: LessThanOrEqual(new Date()) },
      order: { scheduledAt: 'ASC' },
      take: 25,
    });

    let started = 0;
    for (const broadcast of due) {
      try {
        await this.campaignsService.start(broadcast.id, {
          id: broadcast.createdBy ?? 'system',
          name: broadcast.createdByName ?? 'Scheduler',
        });
        started += 1;
      } catch (error) {
        this.logger.warn(
          `Could not start scheduled campaign ${broadcast.id}: ${(error as Error).message}`,
        );
      }
    }
    return started;
  }

  private nextRetryDelayMs(attempt: number): number {
    return Math.min(RETRY_BASE_DELAY_MS * 2 ** Math.max(0, attempt - 1), RETRY_MAX_DELAY_MS);
  }

  private async applyResult(
    recipient: BroadcastRecipient,
    result: BroadcastSendResult,
    now: Date,
  ): Promise<void> {
    recipient.providerMessageId = result.providerMessageId || recipient.providerMessageId;

    switch (result.status) {
      case BroadcastProviderMessageStatus.SENT:
        recipient.status = BroadcastRecipientStatus.SENT;
        recipient.sentAt = now;
        recipient.nextRetryAt = null;
        await this.recipientRepo.save(recipient);
        await this.broadcastRepo.increment({ id: recipient.broadcastId }, 'sentCount', 1);
        return;

      case BroadcastProviderMessageStatus.DELIVERED:
        recipient.status = BroadcastRecipientStatus.DELIVERED;
        recipient.sentAt = recipient.sentAt ?? now;
        recipient.deliveredAt = now;
        recipient.nextRetryAt = null;
        await this.recipientRepo.save(recipient);
        await this.broadcastRepo.increment({ id: recipient.broadcastId }, 'sentCount', 1);
        await this.broadcastRepo.increment({ id: recipient.broadcastId }, 'deliveredCount', 1);
        return;

      case BroadcastProviderMessageStatus.READ:
        recipient.status = BroadcastRecipientStatus.READ;
        recipient.sentAt = recipient.sentAt ?? now;
        recipient.deliveredAt = recipient.deliveredAt ?? now;
        recipient.readAt = now;
        recipient.nextRetryAt = null;
        await this.recipientRepo.save(recipient);
        await this.broadcastRepo.increment({ id: recipient.broadcastId }, 'sentCount', 1);
        await this.broadcastRepo.increment({ id: recipient.broadcastId }, 'deliveredCount', 1);
        await this.broadcastRepo.increment({ id: recipient.broadcastId }, 'readCount', 1);
        return;

      case BroadcastProviderMessageStatus.FAILED:
      default: {
        recipient.attemptCount += 1;
        const canRetry = result.retryable !== false && recipient.attemptCount < MAX_ATTEMPTS;
        if (canRetry) {
          recipient.status = BroadcastRecipientStatus.QUEUED;
          recipient.nextRetryAt = new Date(now.getTime() + this.nextRetryDelayMs(recipient.attemptCount));
        } else {
          recipient.status = BroadcastRecipientStatus.FAILED;
          recipient.failedAt = now;
          recipient.failedReason = result.failureReason ?? 'Provider rejected the message';
          recipient.nextRetryAt = null;
        }
        await this.recipientRepo.save(recipient);
        if (recipient.status === BroadcastRecipientStatus.FAILED) {
          await this.broadcastRepo.increment({ id: recipient.broadcastId }, 'failedCount', 1);
        }
        return;
      }
    }
  }

  /** Claim and deliver queued (or stale) recipients for PROCESSING campaigns. */
  async processQueuedRecipients(batchSize = DEFAULT_BATCH_SIZE): Promise<number> {
    const now = new Date();
    const staleBefore = new Date(now.getTime() - STALE_SENDING_MS);

    const recipients = await this.recipientRepo
      .createQueryBuilder('recipient')
      .innerJoin(Broadcast, 'broadcast', 'broadcast.id = recipient.broadcastId')
      .where('broadcast.status = :processing', { processing: BroadcastStatus.PROCESSING })
      .andWhere(
        `(
           (recipient.status = :queued AND (recipient.nextRetryAt IS NULL OR recipient.nextRetryAt <= :now))
           OR (recipient.status = :sending AND recipient.updatedAt < :staleBefore)
         )`,
        {
          queued: BroadcastRecipientStatus.QUEUED,
          sending: BroadcastRecipientStatus.SENDING,
          now,
          staleBefore,
        },
      )
      .orderBy('recipient.createdAt', 'ASC')
      .take(batchSize)
      .getMany();

    if (recipients.length === 0) return 0;

    const provider = this.providerRegistry.getActive();
    let processed = 0;

    for (const recipient of recipients) {
      // Claim: mark SENDING so a concurrent tick will not pick it up again.
      recipient.status = BroadcastRecipientStatus.SENDING;
      await this.recipientRepo.save(recipient);

      try {
        const result = await provider.sendMessage({
          recipientId: recipient.id,
          to: recipient.phone,
          body: recipient.personalizedMessage ?? '',
          template: {
            providerTemplateId: null,
            name: null,
            language: undefined,
            variables: undefined,
          },
          idempotencyKey: `broadcast:${recipient.broadcastId}:recipient:${recipient.id}`,
          metadata: { broadcastId: recipient.broadcastId },
        });
        await this.applyResult(recipient, result, new Date());
      } catch (error) {
        await this.applyResult(
          recipient,
          {
            providerMessageId: '',
            status: BroadcastProviderMessageStatus.FAILED,
            simulated: provider.simulated,
            failureReason: (error as Error).message,
            retryable: true,
          },
          new Date(),
        );
      }
      processed += 1;
    }

    return processed;
  }

  /**
   * MOCK ONLY. Advances simulated SENT → DELIVERED → READ receipts so the full
   * lifecycle is visible in development. A real provider replaces this with
   * webhook-driven status updates.
   */
  async advanceSimulatedReceipts(batchSize = 50): Promise<number> {
    if (!this.providerRegistry.isSimulated()) return 0;

    const delayMs = Number(process.env.BROADCAST_SIMULATED_RECEIPT_DELAY_MS) || 15_000;
    const readRate = (() => {
      const raw = Number(process.env.BROADCAST_MOCK_READ_RATE);
      return Number.isFinite(raw) && raw >= 0 && raw <= 1 ? raw : 0.7;
    })();

    const now = new Date();
    const cutoff = new Date(now.getTime() - delayMs);
    let advanced = 0;

    const toDeliver = await this.recipientRepo
      .createQueryBuilder('recipient')
      .where('recipient.status = :sent', { sent: BroadcastRecipientStatus.SENT })
      .andWhere('recipient.sentAt IS NOT NULL AND recipient.sentAt <= :cutoff', { cutoff })
      .take(batchSize)
      .getMany();

    for (const recipient of toDeliver) {
      recipient.status = BroadcastRecipientStatus.DELIVERED;
      recipient.deliveredAt = now;
      await this.recipientRepo.save(recipient);
      await this.broadcastRepo.increment({ id: recipient.broadcastId }, 'deliveredCount', 1);
      advanced += 1;
    }

    const toRead = await this.recipientRepo
      .createQueryBuilder('recipient')
      .where('recipient.status = :delivered', { delivered: BroadcastRecipientStatus.DELIVERED })
      .andWhere('recipient.deliveredAt IS NOT NULL AND recipient.deliveredAt <= :cutoff', { cutoff })
      .take(batchSize)
      .getMany();

    for (const recipient of toRead) {
      if (Math.random() > readRate) continue;
      recipient.status = BroadcastRecipientStatus.READ;
      recipient.readAt = now;
      await this.recipientRepo.save(recipient);
      await this.broadcastRepo.increment({ id: recipient.broadcastId }, 'readCount', 1);
      advanced += 1;
    }

    return advanced;
  }

  /** Mark a PROCESSING campaign COMPLETED once every recipient is terminal. */
  async finalizeCompletedCampaigns(): Promise<number> {
    const processing = await this.broadcastRepo.find({
      where: { status: BroadcastStatus.PROCESSING },
      take: 50,
    });

    let completed = 0;
    for (const broadcast of processing) {
      const hasPending = await this.campaignsService.hasPendingRecipients(broadcast.id);
      if (!hasPending) {
        await this.campaignsService.markCompleted(broadcast.id, broadcast.createdByName);
        completed += 1;
      }
    }
    return completed;
  }
}
