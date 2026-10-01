import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { hasAnyPermission, type PermissionBearingUser } from '../utils/permission.js';

/**
 * Enforces the `@Permissions()` decorator on admin/super-admin endpoints.
 *
 * Authorisation is evaluated on the server from the authenticated principal's
 * *effective* permissions (role permissions + direct account grants). Hiding a
 * button in the frontend is never sufficient.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: PermissionBearingUser }>();
    const { user } = request;

    if (!user) {
      throw new ForbiddenException('Insufficient permissions');
    }

    if (!hasAnyPermission(user, requiredPermissions)) {
      throw new ForbiddenException(
        `Missing required permission: ${requiredPermissions.join(' or ')}`,
      );
    }

    return true;
  }
}
