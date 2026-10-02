import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ImpersonationSession } from './entities/impersonation-session.entity.js';
import { ImpersonationReason, ImpersonationStatus } from './enums/impersonation.enum.js';
import type { StartImpersonationDto } from './dto/start-impersonation.dto.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from '../auth/auth.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { User } from '../users/entities/user.entity.js';
import { UserStatus } from '../users/enums/user-status.enum.js';
import { Role } from '../roles/enums/role.enum.js';
import { getRoleNames, isSuperAdmin } from '../common/utils/permission.js';
import type {
  AuthenticatedPrincipal,
  ImpersonationPrincipal,
} from '../common/utils/impersonation.js';

/** Roles a Super Admin is allowed to impersonate. NEVER Admin / Super Admin. */
const IMPERSONATABLE_ROLES: Role[] = [Role.CUSTOMER, Role.SELLER, Role.RIDER];

export interface ImpersonationRequestMeta {
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** A sensitive action that impersonation enforcement blocked for a session. */
export interface BlockedImpersonationAction {
  method: string;
  path: string;
  createdAt: string;
}

/** One impersonation session as returned to the admin history / audit views. */
export interface ImpersonationHistoryRecord {
  sessionId: string;
  actorUserId: string;
  actorName: string | null;
  targetUserId: string;
  targetName: string | null;
  targetRole: string;
  reason: ImpersonationReason;
  reasonNote: string | null;
  status: ImpersonationStatus;
  startedAt: string;
  endedAt: string | null;
  expiresAt: string;
  blockedActions: BlockedImpersonationAction[];
  blockedActionCount: number;
}

/** Filters for the platform-wide impersonation audit listing. */
export interface ImpersonationSessionFilters {
  page?: number;
  limit?: number;
  status?: string;
  reason?: string;
  targetRole?: string;
  targetUserId?: string;
  search?: string;
}

export interface ImpersonationPage {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ImpersonationService {
  constructor(
    @InjectRepository(ImpersonationSession)
    private readonly impersonationRepository: Repository<ImpersonationSession>,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * Maximum impersonation duration in seconds.
   *
   * Configurable via IMPERSONATION_TTL_MINUTES, clamped to a sane 5–120 minute
   * window so a misconfiguration can never create an effectively permanent
   * impersonation session.
   */
  private getTtlSeconds(): number {
    const raw = Number(process.env.IMPERSONATION_TTL_MINUTES);
    const minutes = Number.isFinite(raw) && raw > 0 ? Math.min(Math.max(raw, 5), 120) : 60;
    return Math.round(minutes * 60);
  }

  private displayName(user: User | null | undefined): string | null {
    if (!user) return null;
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return name || user.phone || null;
  }

  /** Pick the single role we are impersonating as, or null when ineligible. */
  private resolveEligibleRole(target: User): Role | null {
    const roleNames = getRoleNames(target);
    // Hard block: privileged accounts are never impersonatable.
    if (roleNames.includes(Role.ADMIN) || roleNames.includes(Role.SUPER_ADMIN)) {
      return null;
    }
    return IMPERSONATABLE_ROLES.find((role) => roleNames.includes(role)) ?? null;
  }

  private toPrincipal(session: ImpersonationSession): ImpersonationPrincipal {
    return {
      sessionId: session.id,
      actorUserId: session.actorUserId,
      actorName: session.actorName,
      actorRoles: [],
      targetUserId: session.targetUserId,
      targetName: session.targetName,
      targetRole: session.targetRole,
      reason: session.reason,
      reasonNote: session.reasonNote,
      startedAt: session.startedAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
    };
  }

  /** Mark a lapsed ACTIVE session as EXPIRED. Best-effort housekeeping. */
  private async expireIfNeeded(session: ImpersonationSession): Promise<boolean> {
    if (session.status === ImpersonationStatus.ACTIVE && session.expiresAt.getTime() <= Date.now()) {
      session.status = ImpersonationStatus.EXPIRED;
      session.endedAt = new Date();
      session.endReason = 'EXPIRED';
      await this.impersonationRepository.save(session);
      return true;
    }
    return false;
  }

  async start(
    actor: AuthenticatedPrincipal,
    dto: StartImpersonationDto,
    meta: ImpersonationRequestMeta = {},
  ) {
    // Defense in depth: the route guard already restricts this to SUPER_ADMIN.
    if (!isSuperAdmin(actor)) {
      throw new ForbiddenException('Only a Super Admin can impersonate a user');
    }

    if (actor.id === dto.userId) {
      throw new BadRequestException('You cannot impersonate your own account');
    }

    const target = await this.usersService.findById(dto.userId);
    if (!target) {
      throw new NotFoundException('User not found');
    }

    const targetRole = this.resolveEligibleRole(target);
    if (!targetRole) {
      throw new ForbiddenException('This account is not eligible for impersonation');
    }

    if (target.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Only active accounts can be impersonated');
    }

    const reasonNote = (dto.reasonNote ?? dto.note ?? null)?.trim() || null;
    if (dto.reason === ImpersonationReason.OTHER && !reasonNote) {
      throw new BadRequestException('A reason note is required when selecting "Other"');
    }

    const ttlSeconds = this.getTtlSeconds();
    const session = await this.impersonationRepository.save(
      this.impersonationRepository.create({
        actorUserId: actor.id,
        actorName: this.displayName(actor as unknown as User),
        targetUserId: target.id,
        targetName: this.displayName(target),
        targetRole,
        reason: dto.reason,
        reasonNote,
        status: ImpersonationStatus.ACTIVE,
        expiresAt: new Date(Date.now() + ttlSeconds * 1000),
        ipAddress: meta.ipAddress ?? null,
        userAgent: meta.userAgent ? meta.userAgent.slice(0, 400) : null,
      }),
    );

    const principal = this.toPrincipal(session);
    const { accessToken, user } = await this.authService.buildImpersonationSession(
      actor as unknown as User,
      target,
      principal,
    );

    await this.auditLogsService.record({
      actorId: actor.id,
      actorName: this.displayName(actor as unknown as User),
      action: 'IMPERSONATION_STARTED',
      targetType: 'User',
      targetId: target.id,
      details: JSON.stringify({
        sessionId: session.id,
        actorUserId: actor.id,
        targetUserId: target.id,
        targetRole,
        reason: dto.reason,
        reasonNote,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        ipAddress: meta.ipAddress ?? null,
        userAgent: meta.userAgent ?? null,
      }),
    });

    return { accessToken, user, impersonation: principal };
  }

  async exit(principal: ImpersonationPrincipal, endReason = 'EXITED_BY_ACTOR') {
    const session = await this.impersonationRepository.findOne({
      where: { id: principal.sessionId },
    });

    if (session && session.status === ImpersonationStatus.ACTIVE) {
      session.status = ImpersonationStatus.ENDED;
      session.endedAt = new Date();
      session.endReason = endReason;
      await this.impersonationRepository.save(session);
    }

    const actor = await this.usersService.findById(principal.actorUserId);
    const tokens = await this.authService.restoreActorSession(actor);

    await this.auditLogsService.record({
      actorId: principal.actorUserId,
      actorName: this.displayName(actor),
      action: 'IMPERSONATION_ENDED',
      targetType: 'User',
      targetId: principal.targetUserId,
      details: JSON.stringify({
        sessionId: principal.sessionId,
        actorUserId: principal.actorUserId,
        targetUserId: principal.targetUserId,
        targetRole: principal.targetRole,
        reason: principal.reason,
        status: session?.status ?? ImpersonationStatus.ENDED,
        startedAt: principal.startedAt,
        endedAt: session?.endedAt ?? new Date().toISOString(),
        endReason,
      }),
    });

    return { ...tokens, impersonation: null };
  }

  private clampPage(page: unknown): number {
    const value = Math.floor(Number(page));
    return Number.isFinite(value) && value > 0 ? value : 1;
  }

  private clampLimit(limit: unknown, fallback: number, max = 50): number {
    const value = Math.floor(Number(limit));
    if (!Number.isFinite(value) || value <= 0) return fallback;
    return Math.min(value, max);
  }

  private buildPage(total: number, page: number, limit: number): ImpersonationPage {
    return { total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  private toHistoryRecord(session: ImpersonationSession): Omit<
    ImpersonationHistoryRecord,
    'blockedActions' | 'blockedActionCount'
  > {
    return {
      sessionId: session.id,
      actorUserId: session.actorUserId,
      actorName: session.actorName,
      targetUserId: session.targetUserId,
      targetName: session.targetName,
      targetRole: session.targetRole,
      reason: session.reason,
      reasonNote: session.reasonNote,
      status: session.status,
      startedAt: session.startedAt.toISOString(),
      endedAt: session.endedAt ? session.endedAt.toISOString() : null,
      expiresAt: session.expiresAt.toISOString(),
    };
  }

  /** Group blocked sensitive actions by the impersonation session they belong to. */
  private async loadBlockedActions(
    sessions: ImpersonationSession[],
  ): Promise<Map<string, BlockedImpersonationAction[]>> {
    const map = new Map<string, BlockedImpersonationAction[]>();
    if (!sessions.length) return map;

    const logs = await this.auditLogsService.findBlockedImpersonationActions(
      sessions.map((session) => session.id),
    );

    for (const log of logs) {
      if (!log.targetId) continue;
      let details: { method?: string; path?: string } = {};
      try {
        details = log.details ? JSON.parse(log.details) : {};
      } catch {
        details = {};
      }
      const list = map.get(log.targetId) ?? [];
      list.push({
        method: details.method ?? 'UNKNOWN',
        path: details.path ?? '',
        createdAt: log.createdAt.toISOString(),
      });
      map.set(log.targetId, list);
    }

    return map;
  }

  private async decorateWithBlockedActions(
    sessions: ImpersonationSession[],
  ): Promise<ImpersonationHistoryRecord[]> {
    const blockedMap = await this.loadBlockedActions(sessions);
    return sessions.map((session) => {
      const blockedActions = blockedMap.get(session.id) ?? [];
      return {
        ...this.toHistoryRecord(session),
        blockedActions,
        blockedActionCount: blockedActions.length,
      };
    });
  }

  /**
   * Paginated impersonation sessions targeting a specific user, newest first.
   * Used by the Super Admin user details page to surface the audit history.
   */
  async getTargetHistory(targetUserId: string, page = 1, limit = 10) {
    const safePage = this.clampPage(page);
    const safeLimit = this.clampLimit(limit, 10);

    const [sessions, total] = await this.impersonationRepository.findAndCount({
      where: { targetUserId },
      order: { startedAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      data: await this.decorateWithBlockedActions(sessions),
      meta: this.buildPage(total, safePage, safeLimit),
    };
  }

  /**
   * Platform-wide impersonation session listing for the Super Admin audit view.
   * Supports filtering by status, reason, effective role, and free-text search.
   */
  async getAllSessions(filters: ImpersonationSessionFilters = {}) {
    const safePage = this.clampPage(filters.page);
    const safeLimit = this.clampLimit(filters.limit, 20);

    const query = this.impersonationRepository
      .createQueryBuilder('session')
      .orderBy('session.startedAt', 'DESC');

    if (filters.status) {
      query.andWhere('session.status = :status', { status: filters.status });
    }
    if (filters.reason) {
      query.andWhere('session.reason = :reason', { reason: filters.reason });
    }
    if (filters.targetRole) {
      query.andWhere('session.targetRole = :targetRole', { targetRole: filters.targetRole });
    }
    if (filters.targetUserId) {
      query.andWhere('session.targetUserId = :targetUserId', {
        targetUserId: filters.targetUserId,
      });
    }
    if (filters.search) {
      query.andWhere(
        '(session.actorName ILIKE :search OR session.targetName ILIKE :search OR session.reasonNote ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const [sessions, total] = await query
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .getManyAndCount();

    return {
      data: await this.decorateWithBlockedActions(sessions),
      meta: this.buildPage(total, safePage, safeLimit),
    };
  }

  /** Current active impersonation session for an actor, or null. */
  async getActiveSession(actorUserId: string) {
    const sessions = await this.impersonationRepository.find({
      where: { actorUserId, status: ImpersonationStatus.ACTIVE },
      order: { startedAt: 'DESC' },
    });

    for (const session of sessions) {
      const expired = await this.expireIfNeeded(session);
      if (!expired) {
        return this.toPrincipal(session);
      }
    }

    return null;
  }
}
