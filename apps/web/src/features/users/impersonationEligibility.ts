import { Role } from './usersApi';
import type { User } from './usersApi';

/**
 * Roles a Super Admin may impersonate. Admin / Super Admin are never eligible.
 * The backend independently enforces this — these helpers only gate the UI.
 */
export const IMPERSONATABLE_ROLES: Role[] = [Role.CUSTOMER, Role.SELLER, Role.RIDER];

/** Dashboard segment for each impersonatable role. */
export const ROLE_DASHBOARD: Record<string, string> = {
  [Role.CUSTOMER]: 'customer',
  [Role.SELLER]: 'seller',
  [Role.RIDER]: 'rider',
};

/** The single supported end-user role held by the target, or null. */
export function getPrimaryImpersonationRole(user: User): Role | null {
  const roles = (user.roles ?? []).map((r) => r.name);
  if (roles.includes(Role.ADMIN) || roles.includes(Role.SUPER_ADMIN)) return null;
  return roles.find((role) => IMPERSONATABLE_ROLES.includes(role)) ?? null;
}

/**
 * A user is eligible for impersonation when they hold a supported end-user
 * role, are active, and are not the acting Super Admin.
 */
export function isImpersonatable(user: User, currentUserId?: string): boolean {
  if (!currentUserId || user.id === currentUserId) return false;
  if (user.status !== 'ACTIVE') return false;
  return getPrimaryImpersonationRole(user) !== null;
}
