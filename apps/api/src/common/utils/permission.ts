import { Role } from '../../roles/enums/role.enum.js';

/**
 * Minimal structural shapes for the authenticated principal.
 *
 * `req.user` is populated by `JwtStrategy` from `UsersService.findById`, so it
 * carries role rows (with their eager permissions) and the account's direct
 * permission grants. Guards must stay tolerant of the raw shapes they may
 * receive (e.g. inside unit tests) instead of assuming a specific entity class.
 */
export interface PermissionBearingRole {
  name?: string;
  permissions?: Array<{ name: string }> | null;
}

export interface PermissionBearingUser {
  roles?: Array<string | PermissionBearingRole> | null;
  directPermissions?: Array<{ name: string }> | null;
}

/** Normalise roles that may arrive as strings or role rows. */
export function getRoleNames(user?: PermissionBearingUser | null): string[] {
  if (!user?.roles) return [];
  return user.roles
    .map((role) => (typeof role === 'string' ? role : (role?.name ?? '')))
    .filter((name): name is string => Boolean(name));
}

/** Super Admins hold system-level authority over the whole platform. */
export function isSuperAdmin(user?: PermissionBearingUser | null): boolean {
  return getRoleNames(user).includes(Role.SUPER_ADMIN);
}

/**
 * Effective permissions = union of every role's permissions plus the account's
 * explicit direct grants.
 */
export function getEffectivePermissions(user?: PermissionBearingUser | null): Set<string> {
  const permissions = new Set<string>();
  if (!user) return permissions;

  for (const role of user.roles ?? []) {
    if (typeof role === 'string' || !role?.permissions) continue;
    for (const permission of role.permissions) {
      if (permission?.name) permissions.add(permission.name);
    }
  }

  for (const permission of user.directPermissions ?? []) {
    if (permission?.name) permissions.add(permission.name);
  }

  return permissions;
}

/** Super Admins implicitly satisfy every permission check. */
export function hasPermission(
  user: PermissionBearingUser | null | undefined,
  permission: string,
): boolean {
  if (isSuperAdmin(user)) return true;
  return getEffectivePermissions(user).has(permission);
}

/** True when the user holds at least one of the requested permissions. */
export function hasAnyPermission(
  user: PermissionBearingUser | null | undefined,
  permissions: string[],
): boolean {
  if (isSuperAdmin(user)) return true;
  const effective = getEffectivePermissions(user);
  return permissions.some((permission) => effective.has(permission));
}
