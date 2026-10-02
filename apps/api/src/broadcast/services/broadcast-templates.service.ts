import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BroadcastTemplate,
  type BroadcastTemplateVariable,
} from '../entities/broadcast-template.entity.js';
import { BroadcastProviderRegistry } from '../providers/broadcast-provider.registry.js';
import { AuditLogsService } from '../../audit-logs/audit-logs.service.js';
import {
  BroadcastTemplateProviderStatus,
  BroadcastTemplateStatus,
} from '../enums/broadcast.enums.js';
import type {
  CreateBroadcastTemplateDto,
  QueryBroadcastTemplatesDto,
  UpdateBroadcastTemplateDto,
} from '../dto/template.dto.js';
import {
  buildVariableDefinitions,
  extractVariableKeys,
  hasInvalidVariableSyntax,
} from '../utils/template-renderer.js';

@Injectable()
export class BroadcastTemplatesService {
  private readonly logger = new Logger(BroadcastTemplatesService.name);

  constructor(
    @InjectRepository(BroadcastTemplate)
    private readonly templateRepo: Repository<BroadcastTemplate>,
    private readonly providerRegistry: BroadcastProviderRegistry,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * Validate that the declared variable list matches the placeholders actually
   * present in the body, and that the body has no malformed placeholders.
   */
  private resolveVariables(
    body: string,
    declared: BroadcastTemplateVariable[] = [],
  ): BroadcastTemplateVariable[] {
    if (hasInvalidVariableSyntax(body)) {
      throw new BadRequestException(
        'Template body contains malformed variables. Use the {{variable_name}} syntax.',
      );
    }

    const extracted = extractVariableKeys(body);
    if (extracted.length === 0) return [];

    const resolved = buildVariableDefinitions(body, declared);
    const declaredKeys = declared.map((item) => item.key);
    const undeclared = extracted.filter((key) => !declaredKeys.includes(key));
    if (declaredKeys.length > 0 && undeclared.length > 0) {
      throw new BadRequestException(
        `Template body references undeclared variables: ${undeclared.join(', ')}`,
      );
    }

    return resolved;
  }

  async create(dto: CreateBroadcastTemplateDto, userId: string | null) {
    const variables = this.resolveVariables(
      dto.body,
      (dto.variables ?? []) as BroadcastTemplateVariable[],
    );

    const template = this.templateRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      language: dto.language ?? 'en',
      category: dto.category,
      body: dto.body,
      variables,
      provider: this.providerRegistry.getActiveName(),
      providerStatus: BroadcastTemplateProviderStatus.LOCAL_ONLY,
      status: dto.status ?? BroadcastTemplateStatus.DRAFT,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.templateRepo.save(template);

    await this.auditLogsService.record({
      actorId: userId,
      action: 'BROADCAST_TEMPLATE_CREATED',
      targetType: 'BroadcastTemplate',
      targetId: saved.id,
      details: JSON.stringify({ name: saved.name, language: saved.language }),
    });

    return saved;
  }

  async findAll(query: QueryBroadcastTemplatesDto = {}) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Math.min(Number(query.limit), 100) : 20;

    const qb = this.templateRepo.createQueryBuilder('template').orderBy('template.createdAt', 'DESC');
    if (query.status) qb.andWhere('template.status = :status', { status: query.status });
    if (query.category) qb.andWhere('template.category = :category', { category: query.category });
    if (query.search) {
      qb.andWhere('(template.name ILIKE :search OR template.body ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<BroadcastTemplate> {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async update(id: string, dto: UpdateBroadcastTemplateDto, userId: string | null) {
    const template = await this.findOne(id);

    if (dto.body !== undefined) {
      template.body = dto.body;
      template.variables = this.resolveVariables(
        dto.body,
        (dto.variables ?? template.variables ?? []) as BroadcastTemplateVariable[],
      );
    } else if (dto.variables !== undefined) {
      template.variables = dto.variables as BroadcastTemplateVariable[];
    }

    if (dto.name !== undefined) template.name = dto.name;
    if (dto.description !== undefined) template.description = dto.description ?? null;
    if (dto.language !== undefined) template.language = dto.language;
    if (dto.category !== undefined) template.category = dto.category;
    if (dto.status !== undefined) template.status = dto.status;
    template.updatedBy = userId;

    const saved = await this.templateRepo.save(template);

    await this.auditLogsService.record({
      actorId: userId,
      action: 'BROADCAST_TEMPLATE_UPDATED',
      targetType: 'BroadcastTemplate',
      targetId: saved.id,
      details: JSON.stringify({ name: saved.name }),
    });

    return saved;
  }

  async updateStatus(id: string, status: BroadcastTemplateStatus, userId: string | null) {
    const template = await this.findOne(id);
    template.status = status;
    template.updatedBy = userId;
    const saved = await this.templateRepo.save(template);

    await this.auditLogsService.record({
      actorId: userId,
      action: 'BROADCAST_TEMPLATE_UPDATED',
      targetType: 'BroadcastTemplate',
      targetId: saved.id,
      details: JSON.stringify({ name: saved.name, status }),
    });

    return saved;
  }

  async remove(id: string, userId: string | null) {
    const template = await this.findOne(id);
    await this.templateRepo.remove(template);

    await this.auditLogsService.record({
      actorId: userId,
      action: 'BROADCAST_TEMPLATE_DELETED',
      targetType: 'BroadcastTemplate',
      targetId: id,
      details: JSON.stringify({ name: template.name }),
    });

    return { message: 'Template deleted successfully' };
  }
}
