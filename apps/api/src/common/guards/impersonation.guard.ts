import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BLOCK_DURING_IMPERSONATION_KEY } from '../decorators/block-during-impersonation.decorator.js';
import {
  getImpersonationContext,
  isImpersonating,
  type AuthenticatedPrincipal,
} from '../utils/impersonation.js';
import { AuditLogsService } from '../../audit-logs/audit-logs.service.js';

/**
 * Server-side enforcement of sensitive-action protection during impersonation.
 *
 * Endpoints annotated with `@BlockDuringImpersonation()` are rejected with 403
 * whenever the request carries an impersonation context, regardless of the
 * target user's own permissions. The Super Admin must exit impersonation first.
 *
 * Every block is written to the audit trail as `IMPERSONATED_ACTION_BLOCKED`,
 * keyed to the impersonation session, so the user history and impersonation
 * audit views can surface exactly what enforcement stopped.
 */
@Injectable()
export class ImpersonationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const blocked = this.reflector.getAllAndOverride<boolean>(BLOCK_DURING_IMPERSONATION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!blocked) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedPrincipal;
      method?: string;
      originalUrl?: string;
      url?: string;
    }>();

    if (isImpersonating(request.user)) {
      const principal = getImpersonationContext(request.user);
      if (principal) {
        const method = (request.method ?? 'UNKNOWN').toUpperCase();
        const path = request.originalUrl ?? request.url ?? '';
        // Best-effort audit write; never blocks the rejection itself.
        void this.auditLogsService.record({
          actorId: principal.actorUserId,
          actorName: principal.actorName,
          action: 'IMPERSONATED_ACTION_BLOCKED',
          targetType: 'ImpersonationSession',
          targetId: principal.sessionId,
          details: JSON.stringify({
            method,
            path,
            sessionId: principal.sessionId,
            actorUserId: principal.actorUserId,
            effectiveUserId: principal.targetUserId,
            effectiveRole: principal.targetRole,
          }),
        });
      }

      throw new ForbiddenException(
        'This action is not allowed while impersonating a user. Please exit impersonation first.',
      );
    }

    return true;
  }
}
