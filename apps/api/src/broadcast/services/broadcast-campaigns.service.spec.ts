import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { BroadcastCampaignsService } from './broadcast-campaigns.service.js';
import { BroadcastTemplatesService } from './broadcast-templates.service.js';
import { BroadcastAudienceService } from './broadcast-audience.service.js';
import { Broadcast } from '../entities/broadcast.entity.js';
import { BroadcastRecipient } from '../entities/broadcast-recipient.entity.js';
import { BroadcastProviderRegistry } from '../providers/broadcast-provider.registry.js';
import { AuditLogsService } from '../../audit-logs/audit-logs.service.js';
import {
  BroadcastAudienceType,
  BroadcastProviderName,
  BroadcastStatus,
} from '../enums/broadcast.enums.js';

describe('BroadcastCampaignsService', () => {
  let service: BroadcastCampaignsService;

  const recipientQb = {
    insert: vi.fn().mockReturnThis(),
    into: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    orIgnore: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue({}),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    addSelect: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    getCount: vi.fn().mockResolvedValue(0),
    getRawMany: vi.fn().mockResolvedValue([]),
  };

  const broadcastRepo = {
    create: vi.fn((x) => x),
    save: vi.fn(async (x: unknown) => ({ ...(x as object), id: 'bc-1' })),
    findOne: vi.fn(),
  };
  const recipientRepo = {
    create: vi.fn((x) => x),
    createQueryBuilder: vi.fn(() => recipientQb),
  };
  const templatesService = { findOne: vi.fn() };
  const audienceService = { resolveRecipients: vi.fn() };
  const providerRegistry = {
    getActiveName: vi.fn(() => BroadcastProviderName.MOCK),
    getActive: vi.fn(),
    isSimulated: vi.fn(() => true),
  };
  const auditLogsService = { record: vi.fn().mockResolvedValue(undefined) };
  const eventEmitter = { emit: vi.fn() };

  const actor = { id: 'admin-1', name: 'Super Admin' };

  beforeEach(async () => {
    vi.clearAllMocks();
    broadcastRepo.save.mockImplementation(async (x: unknown) => ({ ...(x as object), id: 'bc-1' }));
    templatesService.findOne.mockResolvedValue({ id: 'tmpl-1', name: 'Flash', body: 'Hi {{a}}' });
    auditLogsService.record.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BroadcastCampaignsService,
        { provide: getRepositoryToken(Broadcast), useValue: broadcastRepo },
        { provide: getRepositoryToken(BroadcastRecipient), useValue: recipientRepo },
        { provide: BroadcastTemplatesService, useValue: templatesService },
        { provide: BroadcastAudienceService, useValue: audienceService },
        { provide: BroadcastProviderRegistry, useValue: providerRegistry },
        { provide: AuditLogsService, useValue: auditLogsService },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get(BroadcastCampaignsService);
  });

  const createDto = {
    title: 'Eid Campaign',
    templateId: 'tmpl-1',
    audienceType: BroadcastAudienceType.ALL_CUSTOMERS,
  };

  describe('create', () => {
    it('creates a draft when no schedule is provided', async () => {
      const result = await service.create(createDto as never, actor);
      expect(result.status).toBe(BroadcastStatus.DRAFT);
      expect(auditLogsService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'BROADCAST_CREATED' }),
      );
    });

    it('schedules a campaign for a future date', async () => {
      const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const result = await service.create({ ...createDto, scheduledAt } as never, actor);
      expect(result.status).toBe(BroadcastStatus.SCHEDULED);
      expect(result.scheduledAt).toBeInstanceOf(Date);
    });

    it('rejects a schedule in the past', async () => {
      const scheduledAt = new Date(Date.now() - 60 * 1000).toISOString();
      await expect(service.create({ ...createDto, scheduledAt } as never, actor)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('lifecycle', () => {
    it('rejects starting a campaign with no eligible recipients', async () => {
      broadcastRepo.findOne.mockResolvedValue({ id: 'bc-1', status: BroadcastStatus.DRAFT });
      audienceService.resolveRecipients.mockResolvedValue([]);
      await expect(service.start('bc-1', actor)).rejects.toThrow(BadRequestException);
    });

    it('starts a draft, queues recipients and audits the transition', async () => {
      broadcastRepo.findOne.mockResolvedValue({
        id: 'bc-1',
        status: BroadcastStatus.DRAFT,
        title: 'Eid',
        audienceType: BroadcastAudienceType.ALL_CUSTOMERS,
        audienceConfig: {},
        templateId: 'tmpl-1',
      });
      audienceService.resolveRecipients.mockResolvedValue([
        { id: 'cust-1', name: 'Rakib', phone: '+8801700000000' },
      ]);

      const result = await service.start('bc-1', actor);

      expect(result.status).toBe(BroadcastStatus.PROCESSING);
      expect(result.totalRecipients).toBe(1);
      expect(recipientQb.orIgnore).toHaveBeenCalled();
      expect(auditLogsService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'BROADCAST_STARTED' }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'broadcast.campaign.updated',
        expect.objectContaining({ status: BroadcastStatus.PROCESSING }),
      );
    });

    it('refuses an invalid transition (completed → processing)', async () => {
      broadcastRepo.findOne.mockResolvedValue({ id: 'bc-1', status: BroadcastStatus.COMPLETED });
      await expect(service.start('bc-1', actor)).rejects.toThrow(BadRequestException);
    });

    it('cancels a scheduled campaign', async () => {
      broadcastRepo.findOne.mockResolvedValue({ id: 'bc-1', status: BroadcastStatus.SCHEDULED });
      const result = await service.cancel('bc-1', actor);
      expect(result.status).toBe(BroadcastStatus.CANCELLED);
    });

    it('refuses to cancel a processing campaign', async () => {
      broadcastRepo.findOne.mockResolvedValue({ id: 'bc-1', status: BroadcastStatus.PROCESSING });
      await expect(service.cancel('bc-1', actor)).rejects.toThrow(BadRequestException);
    });
  });

  describe('recipient accounting', () => {
    it('reports pending recipients when some are not terminal', async () => {
      recipientQb.getCount.mockResolvedValue(3);
      await expect(service.hasPendingRecipients('bc-1')).resolves.toBe(true);
    });

    it('aggregates stats by recipient status', async () => {
      broadcastRepo.findOne.mockResolvedValue({ id: 'bc-1', status: BroadcastStatus.PROCESSING });
      recipientQb.getRawMany.mockResolvedValue([
        { status: 'DELIVERED', count: '2' },
        { status: 'FAILED', count: '1' },
      ]);
      const stats = await service.getStats('bc-1');
      expect(stats.delivered).toBe(2);
      expect(stats.failed).toBe(1);
      expect(stats.totalRecipients).toBe(3);
      expect(stats.simulated).toBe(true);
    });
  });
});
