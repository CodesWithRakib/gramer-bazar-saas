import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

import { ImpersonationService } from './impersonation.service.js';
import { ImpersonationSession } from './entities/impersonation-session.entity.js';
import {
  ImpersonationReason,
  ImpersonationStatus,
} from './enums/impersonation.enum.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from '../auth/auth.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { UserStatus } from '../users/enums/user-status.enum.js';

describe('ImpersonationService', () => {
  let service: ImpersonationService;

  const queryBuilder = {
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
  };
  const impersonationRepository = {
    create: vi.fn((x) => x),
    save: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    findAndCount: vi.fn(),
    createQueryBuilder: vi.fn(() => queryBuilder),
  };
  const usersService = {
    findById: vi.fn(),
  };
  const authService = {
    buildImpersonationSession: vi.fn(),
    restoreActorSession: vi.fn(),
  };
  const auditLogsService = {
    record: vi.fn().mockResolvedValue(undefined),
    findBlockedImpersonationActions: vi.fn().mockResolvedValue([]),
  };

  const superAdmin = {
    id: 'admin-1',
    firstName: 'Super',
    lastName: 'Admin',
    phone: '+8801700000001',
    status: UserStatus.ACTIVE,
    roles: [{ name: 'SUPER_ADMIN' }],
  };
  const normalAdmin = {
    id: 'admin-2',
    roles: [{ name: 'ADMIN' }],
  };
  const seller = {
    id: 'seller-1',
    firstName: 'Rahim',
    lastName: 'Store',
    phone: '+8801700000002',
    status: UserStatus.ACTIVE,
    roles: [{ name: 'SELLER' }],
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    auditLogsService.record.mockResolvedValue(undefined);
    auditLogsService.findBlockedImpersonationActions.mockResolvedValue([]);
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
    authService.buildImpersonationSession.mockResolvedValue({
      accessToken: 'imp-token',
      user: { id: 'seller-1', roles: ['SELLER'] },
    });
    authService.restoreActorSession.mockResolvedValue({
      accessToken: 'admin-token',
      refreshToken: 'admin-refresh',
      user: { id: 'admin-1', roles: ['SUPER_ADMIN'] },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImpersonationService,
        {
          provide: getRepositoryToken(ImpersonationSession),
          useValue: impersonationRepository,
        },
        { provide: UsersService, useValue: usersService },
        { provide: AuthService, useValue: authService },
        { provide: AuditLogsService, useValue: auditLogsService },
      ],
    }).compile();

    service = module.get<ImpersonationService>(ImpersonationService);
  });

  const dto = (overrides: Record<string, unknown> = {}) => ({
    userId: 'seller-1',
    reason: ImpersonationReason.CUSTOMER_SUPPORT,
    ...overrides,
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authorization', () => {
    it('allows a Super Admin to impersonate an eligible seller', async () => {
      usersService.findById.mockResolvedValue(seller);
      impersonationRepository.save.mockImplementation(async (x: unknown) => ({
        ...(x as object),
        id: 'sess-1',
        startedAt: new Date(),
      }));

      const result = await service.start(superAdmin, dto() as never);

      expect(result.accessToken).toBe('imp-token');
      expect(result.impersonation.targetUserId).toBe('seller-1');
      expect(result.impersonation.actorUserId).toBe('admin-1');
      expect(authService.buildImpersonationSession).toHaveBeenCalledTimes(1);
      expect(auditLogsService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'IMPERSONATION_STARTED', actorId: 'admin-1' }),
      );
    });

    it('rejects a non Super Admin actor even if they call the API directly', async () => {
      await expect(service.start(normalAdmin as never, dto() as never)).rejects.toThrow(
        ForbiddenException,
      );
      expect(authService.buildImpersonationSession).not.toHaveBeenCalled();
    });
  });

  describe('target eligibility', () => {
    it('blocks self impersonation', async () => {
      await expect(
        service.start(superAdmin, dto({ userId: 'admin-1' }) as never),
      ).rejects.toThrow(BadRequestException);
    });

    it('blocks impersonating an Admin', async () => {
      usersService.findById.mockResolvedValue({
        ...seller,
        id: 'admin-2',
        roles: [{ name: 'ADMIN' }],
      });
      await expect(service.start(superAdmin, dto({ userId: 'admin-2' }) as never)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('blocks impersonating a Super Admin', async () => {
      usersService.findById.mockResolvedValue({
        ...seller,
        id: 'admin-9',
        roles: [{ name: 'SUPER_ADMIN' }],
      });
      await expect(service.start(superAdmin, dto({ userId: 'admin-9' }) as never)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('blocks inactive / disabled accounts', async () => {
      usersService.findById.mockResolvedValue({ ...seller, status: UserStatus.BLOCKED });
      await expect(service.start(superAdmin, dto() as never)).rejects.toThrow(BadRequestException);
    });

    it('requires a note when reason is OTHER', async () => {
      usersService.findById.mockResolvedValue(seller);
      await expect(
        service.start(superAdmin, dto({ reason: ImpersonationReason.OTHER }) as never),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('exit', () => {
    it('ends the session, audits it, and restores the actor session', async () => {
      const session = {
        id: 'sess-1',
        status: ImpersonationStatus.ACTIVE,
        endedAt: null as Date | null,
        endReason: null as string | null,
      };
      impersonationRepository.findOne.mockResolvedValue(session);
      impersonationRepository.save.mockImplementation(async (x: unknown) => x);
      usersService.findById.mockResolvedValue(superAdmin);

      const result = await service.exit({
        sessionId: 'sess-1',
        actorUserId: 'admin-1',
        actorName: 'Super Admin',
        actorRoles: [],
        targetUserId: 'seller-1',
        targetName: 'Rahim Store',
        targetRole: 'SELLER',
        reason: ImpersonationReason.CUSTOMER_SUPPORT,
        reasonNote: null,
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      });

      expect(session.status).toBe(ImpersonationStatus.ENDED);
      expect(result.accessToken).toBe('admin-token');
      expect(result.impersonation).toBeNull();
      expect(auditLogsService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'IMPERSONATION_ENDED', actorId: 'admin-1' }),
      );
    });
  });

  describe('getActiveSession', () => {
    it('returns null when there is no active session', async () => {
      impersonationRepository.find.mockResolvedValue([]);
      await expect(service.getActiveSession('admin-1')).resolves.toBeNull();
    });

    it('marks an expired session EXPIRED and returns null', async () => {
      const expired = {
        id: 'sess-old',
        status: ImpersonationStatus.ACTIVE,
        expiresAt: new Date(Date.now() - 1000),
      };
      impersonationRepository.find.mockResolvedValue([expired]);
      impersonationRepository.save.mockImplementation(async (x: unknown) => x);

      await expect(service.getActiveSession('admin-1')).resolves.toBeNull();
      expect(expired.status).toBe(ImpersonationStatus.EXPIRED);
    });
  });

  describe('getTargetHistory', () => {
    const sessionRow = (overrides: Record<string, unknown> = {}) => ({
      id: 'sess-2',
      actorUserId: 'admin-1',
      actorName: 'Super Admin',
      targetUserId: 'seller-1',
      targetName: 'Rahim Store',
      targetRole: 'SELLER',
      reason: ImpersonationReason.CUSTOMER_SUPPORT,
      reasonNote: null,
      status: ImpersonationStatus.ENDED,
      startedAt: new Date('2026-09-26T10:00:00.000Z'),
      endedAt: new Date('2026-09-26T10:30:00.000Z'),
      expiresAt: new Date('2026-09-26T11:00:00.000Z'),
      ...overrides,
    });

    it('returns a paginated page of sessions for the target user', async () => {
      const started = new Date('2026-09-26T10:00:00.000Z');
      impersonationRepository.findAndCount.mockResolvedValue([[sessionRow()], 1]);

      const result = await service.getTargetHistory('seller-1', 1, 10);

      expect(impersonationRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { targetUserId: 'seller-1' },
          skip: 0,
          take: 10,
        }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 10, totalPages: 1 });
      expect(result.data[0].sessionId).toBe('sess-2');
      expect(result.data[0].targetUserId).toBe('seller-1');
      expect(result.data[0].status).toBe(ImpersonationStatus.ENDED);
      expect(result.data[0].startedAt).toBe(started.toISOString());
      expect(result.data[0].blockedActionCount).toBe(0);
    });

    it('observes the requested page and clamps the limit', async () => {
      impersonationRepository.findAndCount.mockResolvedValue([[], 120]);

      const result = await service.getTargetHistory('seller-1', 3, 999);

      expect(impersonationRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 100, take: 50 }),
      );
      expect(result.meta).toEqual({ total: 120, page: 3, limit: 50, totalPages: 3 });
    });

    it('attaches blocked sensitive actions to their session', async () => {
      impersonationRepository.findAndCount.mockResolvedValue([[sessionRow()], 1]);
      auditLogsService.findBlockedImpersonationActions.mockResolvedValue([
        {
          targetId: 'sess-2',
          details: JSON.stringify({ method: 'PATCH', path: '/auth/me/password' }),
          createdAt: new Date('2026-09-26T10:10:00.000Z'),
        },
      ]);

      const result = await service.getTargetHistory('seller-1');

      expect(result.data[0].blockedActionCount).toBe(1);
      expect(result.data[0].blockedActions[0]).toEqual({
        method: 'PATCH',
        path: '/auth/me/password',
        createdAt: '2026-09-26T10:10:00.000Z',
      });
    });
  });

  describe('getAllSessions', () => {
    it('returns a paginated platform-wide listing with filters applied', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([
        [
          {
            id: 'sess-9',
            actorUserId: 'admin-1',
            actorName: 'Super Admin',
            targetUserId: 'seller-1',
            targetName: 'Rahim Store',
            targetRole: 'SELLER',
            reason: ImpersonationReason.BUG_INVESTIGATION,
            reasonNote: null,
            status: ImpersonationStatus.ACTIVE,
            startedAt: new Date('2026-09-27T09:00:00.000Z'),
            endedAt: null,
            expiresAt: new Date('2026-09-27T10:00:00.000Z'),
          },
        ],
        1,
      ]);

      const result = await service.getAllSessions({
        page: 2,
        limit: 5,
        status: 'ACTIVE',
        targetRole: 'SELLER',
        search: 'Rahim',
      });

      expect(impersonationRepository.createQueryBuilder).toHaveBeenCalledWith('session');
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('session.status = :status', {
        status: 'ACTIVE',
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('session.targetRole = :targetRole', {
        targetRole: 'SELLER',
      });
      expect(queryBuilder.skip).toHaveBeenCalledWith(5);
      expect(queryBuilder.take).toHaveBeenCalledWith(5);
      expect(result.meta).toEqual({ total: 1, page: 2, limit: 5, totalPages: 1 });
      expect(result.data[0].sessionId).toBe('sess-9');
    });
  });
});
