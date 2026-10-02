import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ImpersonationGuard } from './impersonation.guard.js';

describe('ImpersonationGuard', () => {
  let guard: ImpersonationGuard;
  const reflector = { getAllAndOverride: vi.fn() };
  const auditLogsService = { record: vi.fn().mockResolvedValue(undefined) };

  const contextFor = (user: unknown) =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          method: 'PATCH',
          originalUrl: '/api/v1/auth/me/password',
        }),
      }),
    }) as never;

  const impersonationPrincipal = {
    sessionId: 'sess-1',
    actorUserId: 'admin-1',
    actorName: 'Super Admin',
    targetUserId: 'seller-1',
    targetRole: 'SELLER',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    auditLogsService.record.mockResolvedValue(undefined);
    guard = new ImpersonationGuard(reflector as unknown as Reflector, auditLogsService as never);
  });

  it('allows requests on endpoints that do not opt into blocking', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    expect(guard.canActivate(contextFor({ id: 'admin-1' }))).toBe(true);
  });

  it('allows a genuine (non-impersonating) user', () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    expect(guard.canActivate(contextFor({ id: 'admin-1', impersonation: null }))).toBe(true);
    expect(auditLogsService.record).not.toHaveBeenCalled();
  });

  it('blocks an impersonating request and records the blocked action', () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    expect(() =>
      guard.canActivate(contextFor({ id: 'seller-1', impersonation: impersonationPrincipal })),
    ).toThrow(ForbiddenException);

    expect(auditLogsService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'IMPERSONATED_ACTION_BLOCKED',
        targetType: 'ImpersonationSession',
        targetId: 'sess-1',
        actorId: 'admin-1',
      }),
    );
    const details = JSON.parse(auditLogsService.record.mock.calls[0][0].details);
    expect(details.method).toBe('PATCH');
    expect(details.path).toBe('/api/v1/auth/me/password');
  });
});
