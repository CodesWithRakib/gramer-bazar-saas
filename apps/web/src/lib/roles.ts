import { UserProfile } from '../store/slices/authSlice';

/**
 * Normalized role names for the current user (e.g. 'ADMIN', 'SELLER', 'RIDER', 'CUSTOMER').
 * Roles arrive from the API either as strings or objects ({ name }) — normalizeRole handles both.
 */
export const getUserRoles = (user: UserProfile | null | undefined): string[] => {
  if (!user) return [];
  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles
    .map((r: string | { name?: string }) =>
      typeof r === 'string' ? r : (r?.name ?? ''),
    )
    .filter(Boolean);
};

export const userHasRole = (
  user: UserProfile | null | undefined,
  ...allowed: string[]
): boolean => {
  const roles = getUserRoles(user);
  return allowed.some((r) => roles.includes(r));
};
