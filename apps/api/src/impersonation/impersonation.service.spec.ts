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

  const impersonationRepository = {
    create: vi.fn((x) => x),
    save: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
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
    it('returns recent sessions for the target user', async () => {
      const started = new Date('2026-09-26T10:00:00.000Z');
      impersonationRepository.find.mockResolvedValue([
        {
          id: 'sess-2',
          actorUserId: 'admin-1',
          actorName: 'Super Admin',
          targetRole: 'SELLER',
          reason: ImpersonationReason.CUSTOMER_SUPPORT,
          reasonNote: null,
          status: ImpersonationStatus.ENDED,
          startedAt: started,
          endedAt: new Date('2026-09-26T10:30:00.000Z'),
          expiresAt: new Date('2026-09-26T11:00:00.000Z'),
        },
      ]);

      const result = await service.getTargetHistory('seller-1');

      expect(impersonationRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { targetUserId: 'seller-1' } }),
      );
      expect(result).toHaveLength(1);
      expect(result[0].sessionId).toBe('sess-2');
      expect(result[0].status).toBe(ImpersonationStatus.ENDED);
      expect(result[0].startedAt).toBe(started.toISOString());
    });
  });
});
