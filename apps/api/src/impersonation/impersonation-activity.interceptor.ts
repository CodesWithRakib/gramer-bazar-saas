import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { getImpersonationContext, type AuthenticatedPrincipal } from '../common/utils/impersonation.js';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Records important actions performed while impersonating so the audit trail
 * makes the ACTOR / EFFECTIVE USER distinction explicit.
 *
 * Example entry: actor = Super Admin 100, target = Seller 250, action = the
 * HTTP method + route. This prevents audit logs from falsely presenting the
 * Super Admin's actions as if the impersonated user performed them.
 *
 * Read-only requests are not logged. Failures never break the request.
 */
@Injectable()
export class ImpersonationActivityInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<{
      method?: string;
      originalUrl?: string;
      url?: string;
      user?: AuthenticatedPrincipal;
    }>();

    const principal = getImpersonationContext(request.user);
    const method = (request.method ?? 'GET').toUpperCase();

    if (!principal || !MUTATING_METHODS.has(method)) {
      return next.handle();
    }

    const path = request.originalUrl ?? request.url ?? '';

    // The impersonation lifecycle endpoints are audited by the service itself.
    if (path.includes('/admin/impersonation')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => {
          void this.auditLogsService.record({
            actorId: principal.actorUserId,
            actorName: principal.actorName,
            action: 'IMPERSONATED_ACTION',
            targetType: 'User',
            targetId: principal.targetUserId,
            details: JSON.stringify({
              method,
              path,
              sessionId: principal.sessionId,
              actorUserId: principal.actorUserId,
              effectiveUserId: principal.targetUserId,
              effectiveRole: principal.targetRole,
            }),
          });
        },
      }),
    );
  }
}
