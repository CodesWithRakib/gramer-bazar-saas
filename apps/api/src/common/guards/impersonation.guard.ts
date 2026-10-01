import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BLOCK_DURING_IMPERSONATION_KEY } from '../decorators/block-during-impersonation.decorator.js';
import { isImpersonating, type AuthenticatedPrincipal } from '../utils/impersonation.js';

/**
 * Server-side enforcement of sensitive-action protection during impersonation.
 *
 * Endpoints annotated with `@BlockDuringImpersonation()` are rejected with 403
 * whenever the request carries an impersonation context, regardless of the
 * target user's own permissions. The Super Admin must exit impersonation first.
 */
@Injectable()
export class ImpersonationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const blocked = this.reflector.getAllAndOverride<boolean>(BLOCK_DURING_IMPERSONATION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!blocked) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedPrincipal }>();
    if (isImpersonating(request.user)) {
      throw new ForbiddenException(
        'This action is not allowed while impersonating a user. Please exit impersonation first.',
      );
    }

    return true;
  }
}
