import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity.js';

export interface RecordAuditLogInput {
  actorId?: string | null;
  actorName?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  details?: string | null;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Persist an audit entry. Never throws so that a logging failure cannot break
   * the underlying business operation.
   */
  async record(input: RecordAuditLogInput): Promise<void> {
    try {
      const entry = this.auditLogRepository.create({
        actorId: input.actorId ?? null,
        actorName: input.actorName ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        details: input.details ?? null,
      });
      await this.auditLogRepository.save(entry);
    } catch {
      // Audit logging is best-effort and must not fail the caller.
    }
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const query = this.auditLogRepository
      .createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC');

    if (search) {
      query.andWhere(
        '(log.action ILIKE :search OR log.actorName ILIKE :search OR log.details ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
