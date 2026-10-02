import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';

import { Broadcast, type BroadcastAudienceConfig } from '../entities/broadcast.entity.js';
import {
  TERMINAL_RECIPIENT_STATUSES,
  BROADCAST_ALLOWED_TRANSITIONS,
  BroadcastRecipientStatus,
  BroadcastStatus,
} from '../enums/broadcast.enums.js';
import { BroadcastRecipient } from '../entities/broadcast-recipient.entity.js';
import { BroadcastProviderRegistry } from '../providers/broadcast-provider.registry.js';
import { BroadcastTemplatesService } from './broadcast-templates.service.js';
import { BroadcastAudienceService } from './broadcast-audience.service.js';
import { AuditLogsService } from '../../audit-logs/audit-logs.service.js';
import { renderTemplate } from '../utils/template-renderer.js';
import type {
  BroadcastStatsDto,
  CreateBroadcastCampaignDto,
  QueryBroadcastRecipientsDto,
  QueryBroadcastsDto,
  TestBroadcastSendDto,
  UpdateBroadcastCampaignDto,
} from '../dto/campaign.dto.js';

export interface BroadcastActor {
  id: string;
  name: string;
}

@Injectable()
export class BroadcastCampaignsService {
  private readonly logger = new Logger(BroadcastCampaignsService.name);

  constructor(
    @InjectRepository(Broadcast)
    private readonly broadcastRepo: Repository<Broadcast>,
    @InjectRepository(BroadcastRecipient)
    private readonly recipientRepo: Repository<BroadcastRecipient>,
    private readonly templatesService: BroadcastTemplatesService,
    private readonly audienceService: BroadcastAudienceService,
    private readonly providerRegistry: BroadcastProviderRegistry,
    private readonly auditLogsService: AuditLogsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /** Broadcast a real-time update to Super Admin dashboards (existing Socket.IO). */
  private emitUpdated(broadcast: Broadcast, event: string): void {
    this.eventEmitter.emit('broadcast.campaign.updated', {
      id: broadcast.id,
      title: broadcast.title,
      status: broadcast.status,
      event,
      totalRecipients: broadcast.totalRecipients,
      sentCount: broadcast.sentCount,
      deliveredCount: broadcast.deliveredCount,
      failedCount: broadcast.failedCount,
    });
  }

  private assertTransition(from: BroadcastStatus, to: BroadcastStatus): void {
    const allowed = BROADCAST_ALLOWED_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(`Invalid campaign state transition: ${from} → ${to}`);
    }
  }

  private toAudienceConfig(config?: BroadcastAudienceConfig | null): BroadcastAudienceConfig {
    return (config ?? {}) as BroadcastAudienceConfig;
  }

  async create(dto: CreateBroadcastCampaignDto, actor: BroadcastActor) {
    const template = await this.templatesService.findOne(dto.templateId);

    let status = BroadcastStatus.DRAFT;
    let scheduledAt: Date | null = null;

    if (dto.scheduledAt) {
      scheduledAt = new Date(dto.scheduledAt);
      if (Number.isNaN(scheduledAt.getTime())) {
        throw new BadRequestException('Invalid schedule date');
      }
      if (scheduledAt.getTime() <= Date.now()) {
        throw new BadRequestException('Scheduled time must be in the future');
      }
      status = BroadcastStatus.SCHEDULED;
    }

    const broadcast = this.broadcastRepo.create({
      title: dto.title,
      templateId: template.id,
      templateName: template.name,
      provider: this.providerRegistry.getActiveName(),
      audienceType: dto.audienceType,
      audienceConfig: (dto.audienceConfig ?? {}) as BroadcastAudienceConfig,
      status,
      scheduledAt,
      createdBy: actor.id,
      createdByName: actor.name,
    });

    const saved = await this.broadcastRepo.save(broadcast);

    await this.auditLogsService.record({
      actorId: actor.id,
      actorName: actor.name,
      action: status === BroadcastStatus.SCHEDULED ? 'BROADCAST_SCHEDULED' : 'BROADCAST_CREATED',
      targetType: 'Broadcast',
      targetId: saved.id,
      details: JSON.stringify({
        title: saved.title,
        templateId: template.id,
        audienceType: saved.audienceType,
        scheduledAt: saved.scheduledAt,
      }),
    });

    return saved;
  }

  async findAll(query: QueryBroadcastsDto = {}) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Math.min(Number(query.limit), 100) : 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = (query.sortOrder ?? 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const qb = this.broadcastRepo
      .createQueryBuilder('broadcast')
      .orderBy(`broadcast.${sortBy}`, sortOrder);

    if (query.status) qb.andWhere('broadcast.status = :status', { status: query.status });
    if (query.audienceType) {
      qb.andWhere('broadcast.audienceType = :audienceType', { audienceType: query.audienceType });
    }
    if (query.search) {
      qb.andWhere(
        '(broadcast.title ILIKE :search OR broadcast.templateName ILIKE :search OR broadcast.createdByName ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.from) {
      qb.andWhere('broadcast.createdAt >= :from', { from: new Date(query.from) });
    }
    if (query.to) {
      qb.andWhere('broadcast.createdAt <= :to', { to: new Date(query.to) });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: data.map((item) => this.withSimulatedFlag(item)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private withSimulatedFlag(broadcast: Broadcast): Broadcast & { simulated: boolean } {
    return Object.assign(broadcast, { simulated: this.providerRegistry.isSimulated() });
  }

  async findOne(id: string) {
    const broadcast = await this.broadcastRepo.findOne({
      where: { id },
      relations: { template: true },
    });
    if (!broadcast) throw new NotFoundException('Broadcast campaign not found');
    return this.withSimulatedFlag(broadcast);
  }

  async update(id: string, dto: UpdateBroadcastCampaignDto, actor: BroadcastActor) {
    const broadcast = await this.findOne(id);
    if (broadcast.status !== BroadcastStatus.DRAFT && broadcast.status !== BroadcastStatus.SCHEDULED) {
      throw new BadRequestException('Only draft or scheduled campaigns can be edited');
    }

    if (dto.templateId) {
      const template = await this.templatesService.findOne(dto.templateId);
      broadcast.templateId = template.id;
      broadcast.templateName = template.name;
    }
    if (dto.title !== undefined) broadcast.title = dto.title;
    if (dto.audienceType !== undefined) broadcast.audienceType = dto.audienceType;
    if (dto.audienceConfig !== undefined) {
      broadcast.audienceConfig = dto.audienceConfig as BroadcastAudienceConfig;
    }
    if (dto.scheduledAt !== undefined) {
      const scheduledAt = new Date(dto.scheduledAt);
      if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
        throw new BadRequestException('Scheduled time must be in the future');
      }
      broadcast.scheduledAt = scheduledAt;
      broadcast.status = BroadcastStatus.SCHEDULED;
    }

    const saved = await this.broadcastRepo.save(broadcast);

    await this.auditLogsService.record({
      actorId: actor.id,
      actorName: actor.name,
      action: 'BROADCAST_UPDATED',
      targetType: 'Broadcast',
      targetId: saved.id,
      details: JSON.stringify({ title: saved.title, audienceType: saved.audienceType }),
    });

    return saved;
  }

  /**
   * Transition a DRAFT/SCHEDULED campaign into PROCESSING: resolve the audience,
   * persist recipient snapshots, and hand them to the background processor.
   */
  async start(id: string, actor: BroadcastActor) {
    const broadcast = await this.broadcastRepo.findOne({ where: { id } });
    if (!broadcast) throw new NotFoundException('Broadcast campaign not found');

    this.assertTransition(broadcast.status, BroadcastStatus.PROCESSING);

    const template = await this.templatesService.findOne(broadcast.templateId ?? '');
    const config = this.toAudienceConfig(broadcast.audienceConfig);
    const recipients = await this.audienceService.resolveRecipients(broadcast.audienceType, config);

    if (recipients.length === 0) {
      throw new BadRequestException('No eligible recipients for the selected audience');
    }

    broadcast.status = BroadcastStatus.PROCESSING;
    broadcast.startedAt = new Date();
    broadcast.failureReason = null;
    broadcast.totalRecipients = recipients.length;
    broadcast.sentCount = 0;
    broadcast.deliveredCount = 0;
    broadcast.readCount = 0;
    broadcast.failedCount = 0;
    await this.broadcastRepo.save(broadcast);

    // Idempotent insert: the unique (broadcast_id, customer_id) constraint keeps
    // an accidental double-send from enqueuing a recipient twice.
    const rows = recipients.map((recipient) =>
      this.recipientRepo.create({
        broadcastId: broadcast.id,
        customerId: recipient.id,
        customerName: recipient.name,
        phone: recipient.phone,
        personalizedMessage: renderTemplate(template.body, {
          ...config.variables,
          customer_name: recipient.name ?? '',
          customer_phone: recipient.phone,
        }),
        status: BroadcastRecipientStatus.QUEUED,
      }),
    );

    await this.recipientRepo
      .createQueryBuilder()
      .insert()
      .into(BroadcastRecipient)
      .values(rows)
      .orIgnore()
      .execute();

    this.emitUpdated(broadcast, 'started');

    await this.auditLogsService.record({
      actorId: actor.id,
      actorName: actor.name,
      action: 'BROADCAST_STARTED',
      targetType: 'Broadcast',
      targetId: broadcast.id,
      details: JSON.stringify({
        title: broadcast.title,
        audienceType: broadcast.audienceType,
        totalRecipients: recipients.length,
        provider: broadcast.provider,
      }),
    });

    return broadcast;
  }

  /** Explicit "send now" — same behaviour as starting a scheduled campaign. */
  async sendNow(id: string, actor: BroadcastActor) {
    return this.start(id, actor);
  }

  async cancel(id: string, actor: BroadcastActor) {
    const broadcast = await this.broadcastRepo.findOne({ where: { id } });
    if (!broadcast) throw new NotFoundException('Broadcast campaign not found');

    if (
      broadcast.status !== BroadcastStatus.DRAFT &&
      broadcast.status !== BroadcastStatus.SCHEDULED
    ) {
      throw new BadRequestException('Only a draft or scheduled campaign can be cancelled');
    }

    this.assertTransition(broadcast.status, BroadcastStatus.CANCELLED);
    broadcast.status = BroadcastStatus.CANCELLED;
    broadcast.cancelledAt = new Date();
    const saved = await this.broadcastRepo.save(broadcast);
    this.emitUpdated(saved, 'cancelled');

    await this.auditLogsService.record({
      actorId: actor.id,
      actorName: actor.name,
      action: 'BROADCAST_CANCELLED',
      targetType: 'Broadcast',
      targetId: saved.id,
      details: JSON.stringify({ title: saved.title }),
    });

    return saved;
  }

  /**
   * Send a single test message through the active provider. No recipient row is
   * created. The mock provider returns a clearly-marked simulated result.
   */
  async testSend(id: string, dto: TestBroadcastSendDto, actor: BroadcastActor) {
    const broadcast = await this.findOne(id);
    const template = await this.templatesService.findOne(broadcast.templateId ?? '');
    const config = this.toAudienceConfig(broadcast.audienceConfig);

    const renderedBody = renderTemplate(template.body, {
      ...config.variables,
      ...dto.variables,
      customer_name: dto.variables?.customer_name ?? 'Test Customer',
      customer_phone: dto.phone,
    });

    const provider = this.providerRegistry.getActive();
    const result = await provider.sendMessage({
      recipientId: `test-${broadcast.id}`,
      to: dto.phone,
      body: renderedBody,
      template: {
        providerTemplateId: template.providerTemplateId,
        name: template.name,
        language: template.language,
        variables: { ...config.variables, ...dto.variables },
      },
      idempotencyKey: `broadcast:${broadcast.id}:test:${dto.phone}:${Date.now()}`,
      metadata: { type: 'test' },
    });

    await this.auditLogsService.record({
      actorId: actor.id,
      actorName: actor.name,
      action: 'BROADCAST_TEST_SENT',
      targetType: 'Broadcast',
      targetId: broadcast.id,
      details: JSON.stringify({ phone: dto.phone, provider: broadcast.provider, simulated: result.simulated }),
    });

    return {
      broadcastId: broadcast.id,
      phone: dto.phone,
      renderedBody,
      status: result.status,
      providerMessageId: result.providerMessageId,
      simulated: result.simulated,
      failureReason: result.failureReason ?? null,
    };
  }

  async getStats(id: string): Promise<BroadcastStatsDto> {
    await this.findOne(id);
    const rows = await this.recipientRepo
      .createQueryBuilder('recipient')
      .select('recipient.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('recipient.broadcastId = :id', { id })
      .groupBy('recipient.status')
      .getRawMany<{ status: BroadcastRecipientStatus; count: string }>();

    const byStatus = rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = Number(row.count);
      return acc;
    }, {});

    return {
      totalRecipients: Object.values(byStatus).reduce((sum, value) => sum + value, 0),
      pending: byStatus[BroadcastRecipientStatus.PENDING] ?? 0,
      queued: byStatus[BroadcastRecipientStatus.QUEUED] ?? 0,
      sending: byStatus[BroadcastRecipientStatus.SENDING] ?? 0,
      sent: byStatus[BroadcastRecipientStatus.SENT] ?? 0,
      delivered: byStatus[BroadcastRecipientStatus.DELIVERED] ?? 0,
      read: byStatus[BroadcastRecipientStatus.READ] ?? 0,
      failed: byStatus[BroadcastRecipientStatus.FAILED] ?? 0,
      simulated: this.providerRegistry.isSimulated(),
    };
  }

  async getRecipients(id: string, query: QueryBroadcastRecipientsDto = {}) {
    await this.findOne(id);
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Math.min(Number(query.limit), 100) : 20;

    const qb = this.recipientRepo
      .createQueryBuilder('recipient')
      .where('recipient.broadcastId = :id', { id })
      .orderBy('recipient.createdAt', 'ASC');

    if (query.status) qb.andWhere('recipient.status = :status', { status: query.status });
    if (query.search) {
      qb.andWhere('(recipient.customerName ILIKE :search OR recipient.phone ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  /** Internal helper used by the processor to finalize a drained campaign. */
  async markCompleted(broadcastId: string, actorName: string | null) {
    const broadcast = await this.broadcastRepo.findOne({ where: { id: broadcastId } });
    if (!broadcast || broadcast.status !== BroadcastStatus.PROCESSING) return;

    broadcast.status = BroadcastStatus.COMPLETED;
    broadcast.completedAt = new Date();
    await this.broadcastRepo.save(broadcast);
    this.emitUpdated(broadcast, 'completed');

    await this.auditLogsService.record({
      actorId: broadcast.createdBy,
      actorName,
      action: 'BROADCAST_COMPLETED',
      targetType: 'Broadcast',
      targetId: broadcast.id,
      details: JSON.stringify({
        title: broadcast.title,
        sentCount: broadcast.sentCount,
        deliveredCount: broadcast.deliveredCount,
        failedCount: broadcast.failedCount,
      }),
    });
  }

  async markFailed(broadcastId: string, reason: string) {
    const broadcast = await this.broadcastRepo.findOne({ where: { id: broadcastId } });
    if (!broadcast || broadcast.status !== BroadcastStatus.PROCESSING) return;

    broadcast.status = BroadcastStatus.FAILED;
    broadcast.failureReason = reason;
    await this.broadcastRepo.save(broadcast);
    this.emitUpdated(broadcast, 'failed');

    await this.auditLogsService.record({
      actorId: broadcast.createdBy,
      action: 'BROADCAST_FAILED',
      targetType: 'Broadcast',
      targetId: broadcast.id,
      details: JSON.stringify({ title: broadcast.title, reason }),
    });
  }

  /** True when all recipients of a broadcast reached a terminal status. */
  async hasPendingRecipients(broadcastId: string): Promise<boolean> {
    const count = await this.recipientRepo
      .createQueryBuilder('recipient')
      .where('recipient.broadcastId = :id', { id: broadcastId })
      .andWhere('recipient.status NOT IN (:...terminal)', {
        terminal: TERMINAL_RECIPIENT_STATUSES,
      })
      .getCount();
    return count > 0;
  }
}
