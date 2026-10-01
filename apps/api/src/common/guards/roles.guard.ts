import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../roles/enums/role.enum.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { getRoleNames, isSuperAdmin, type PermissionBearingUser } from '../utils/permission.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: PermissionBearingUser }>();
    const { user } = request;

    if (!user) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const roleNames = getRoleNames(user);
    const hasRole = requiredRoles.some((role) => roleNames.includes(role));

    // Super Admins hold system-level authority across every protected surface.
    if (!hasRole && !isSuperAdmin(user)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
