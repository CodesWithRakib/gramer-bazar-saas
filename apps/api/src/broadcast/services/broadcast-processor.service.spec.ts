import { vi, describe, it, expect, beforeEach } from 'vitest';

import { BroadcastProcessorService } from './broadcast-processor.service.js';
import { Broadcast } from '../entities/broadcast.entity.js';
import { BroadcastRecipient } from '../entities/broadcast-recipient.entity.js';
import { BroadcastCampaignsService } from './broadcast-campaigns.service.js';
import { BroadcastProviderRegistry } from '../providers/broadcast-provider.registry.js';
import {
  BroadcastProviderMessageStatus,
  BroadcastRecipientStatus,
  BroadcastStatus,
} from '../enums/broadcast.enums.js';

describe('BroadcastProcessorService', () => {
  let service: BroadcastProcessorService;

  const queryQb = {
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getMany: vi.fn().mockResolvedValue([]),
  };
  const recipientRepo = {
    createQueryBuilder: vi.fn(() => queryQb),
    save: vi.fn(async (x: unknown) => x),
  };
  const broadcastRepo = {
    find: vi.fn().mockResolvedValue([]),
    increment: vi.fn().mockResolvedValue(undefined),
  };
  const campaignsService = {
    start: vi.fn().mockResolvedValue({}),
    hasPendingRecipients: vi.fn().mockResolvedValue(false),
    markCompleted: vi.fn().mockResolvedValue(undefined),
  };
  const sendMessage = vi.fn();
  const providerRegistry = {
    getActive: vi.fn(() => ({ simulated: true, sendMessage })),
    isSimulated: vi.fn(() => true),
  };

  const makeRecipient = (overrides: Partial<BroadcastRecipient> = {}): BroadcastRecipient =>
    ({
      id: 'r-1',
      broadcastId: 'bc-1',
      phone: '+8801700000000',
      personalizedMessage: 'Hi',
      status: BroadcastRecipientStatus.QUEUED,
      attemptCount: 0,
      nextRetryAt: null,
      providerMessageId: null,
      sentAt: null,
      deliveredAt: null,
      readAt: null,
      failedAt: null,
      failedReason: null,
      ...overrides,
    }) as BroadcastRecipient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryQb.getMany.mockResolvedValue([]);
    broadcastRepo.find.mockResolvedValue([]);
    providerRegistry.getActive.mockReturnValue({ simulated: true, sendMessage });
    providerRegistry.isSimulated.mockReturnValue(true);
    campaignsService.hasPendingRecipients.mockResolvedValue(false);
    service = new BroadcastProcessorService(
      broadcastRepo as never,
      recipientRepo as never,
      campaignsService as unknown as BroadcastCampaignsService,
      providerRegistry as unknown as BroadcastProviderRegistry,
    );
  });

  it('marks a recipient SENT and increments the counter on success', async () => {
    const recipient = makeRecipient();
    queryQb.getMany.mockResolvedValue([recipient]);
    sendMessage.mockResolvedValue({
      providerMessageId: 'mock-1',
      status: BroadcastProviderMessageStatus.SENT,
      simulated: true,
    });

    const processed = await service.processQueuedRecipients();

    expect(processed).toBe(1);
    expect(recipient.status).toBe(BroadcastRecipientStatus.SENT);
    expect(recipient.sentAt).toBeInstanceOf(Date);
    expect(broadcastRepo.increment).toHaveBeenCalledWith({ id: 'bc-1' }, 'sentCount', 1);
  });

  it('re-queues a recipient with backoff on a retryable failure', async () => {
    const recipient = makeRecipient();
    queryQb.getMany.mockResolvedValue([recipient]);
    sendMessage.mockResolvedValue({
      providerMessageId: '',
      status: BroadcastProviderMessageStatus.FAILED,
      simulated: true,
      failureReason: 'transient',
      retryable: true,
    });

    await service.processQueuedRecipients();

    expect(recipient.status).toBe(BroadcastRecipientStatus.QUEUED);
    expect(recipient.attemptCount).toBe(1);
    expect(recipient.nextRetryAt).toBeInstanceOf(Date);
    expect(broadcastRepo.increment).not.toHaveBeenCalled();
  });

  it('permanently fails a recipient after exhausting retries', async () => {
    const recipient = makeRecipient({ attemptCount: 2 });
    queryQb.getMany.mockResolvedValue([recipient]);
    sendMessage.mockResolvedValue({
      providerMessageId: '',
      status: BroadcastProviderMessageStatus.FAILED,
      simulated: true,
      failureReason: 'permanent',
      retryable: true,
    });

    await service.processQueuedRecipients();

    expect(recipient.status).toBe(BroadcastRecipientStatus.FAILED);
    expect(recipient.failedAt).toBeInstanceOf(Date);
    expect(broadcastRepo.increment).toHaveBeenCalledWith({ id: 'bc-1' }, 'failedCount', 1);
  });

  it('never retries a non-retryable failure', async () => {
    const recipient = makeRecipient();
    queryQb.getMany.mockResolvedValue([recipient]);
    sendMessage.mockResolvedValue({
      providerMessageId: '',
      status: BroadcastProviderMessageStatus.FAILED,
      simulated: true,
      failureReason: 'blocked',
      retryable: false,
    });

    await service.processQueuedRecipients();

    expect(recipient.status).toBe(BroadcastRecipientStatus.FAILED);
    expect(recipient.attemptCount).toBe(1);
  });

  it('starts due scheduled campaigns', async () => {
    broadcastRepo.find.mockResolvedValue([
      { id: 'bc-9', createdBy: 'admin-1', createdByName: 'Super Admin' },
    ]);
    const started = await service.processScheduledCampaigns();
    expect(started).toBe(1);
    expect(campaignsService.start).toHaveBeenCalledWith('bc-9', {
      id: 'admin-1',
      name: 'Super Admin',
    });
  });

  it('finalizes a drained campaign', async () => {
    broadcastRepo.find.mockResolvedValue([
      { id: 'bc-1', status: BroadcastStatus.PROCESSING, createdByName: 'Super Admin' },
    ]);
    campaignsService.hasPendingRecipients.mockResolvedValue(false);

    const completed = await service.finalizeCompletedCampaigns();

    expect(completed).toBe(1);
    expect(campaignsService.markCompleted).toHaveBeenCalledWith('bc-1', 'Super Admin');
  });

  it('does not advance simulated receipts when a real provider is active', async () => {
    providerRegistry.isSimulated.mockReturnValue(false);
    await expect(service.advanceSimulatedReceipts()).resolves.toBe(0);
  });
});
