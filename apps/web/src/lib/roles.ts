import { UserProfile } from '../store/slices/authSlice';

/**
 * Normalized role names for the current user (e.g. 'ADMIN', 'SELLER', 'RIDER', 'CUSTOMER').
 * Roles arrive from the API either as strings or objects ({ name }) — normalizeRole handles both.
 */
export const getUserRoles = (user: UserProfile | null | undefined): string[] => {
  if (!user) return [];
  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles
    .map((r: string | { name?: string }) => (typeof r === 'string' ? r : (r?.name ?? '')))
    .filter(Boolean);
};

export const userHasRole = (
  user: UserProfile | null | undefined,
  ...allowed: string[]
): boolean => {
  const roles = getUserRoles(user);
  return allowed.some((r) => roles.includes(r));
};

/** True when the account holds the SUPER_ADMIN role. */
export const userIsSuperAdmin = (user: UserProfile | null | undefined): boolean =>
  getUserRoles(user).includes('SUPER_ADMIN');

/** Effective permissions granted by the backend. */
export const getUserPermissions = (user: UserProfile | null | undefined): string[] => {
  if (!user || !Array.isArray(user.permissions)) return [];
  return user.permissions.filter((p): p is string => typeof p === 'string');
};

/**
 * Check an effective permission.
 *
 * This only gates navigation and buttons — the backend independently enforces
 * every permission, so hiding a control here is never the security boundary.
 */
export const userHasPermission = (
  user: UserProfile | null | undefined,
  permission: string
): boolean => {
  if (userIsSuperAdmin(user)) return true;
  return getUserPermissions(user).includes(permission);
};

/** True when the user holds at least one of the requested permissions. */
export const userHasAnyPermission = (
  user: UserProfile | null | undefined,
  permissions: string[]
): boolean => {
  if (userIsSuperAdmin(user)) return true;
  const effective = getUserPermissions(user);
  return permissions.some((p) => effective.includes(p));
};
