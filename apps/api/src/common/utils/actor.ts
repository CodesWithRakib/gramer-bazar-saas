import type { AuthenticatedRequest, AuthenticatedUser } from '../types/authenticated-request.js';

/** Normalised authenticated actor used by tenant-scoped services. */
export interface Actor {
  id: string;
  roles: string[];
  fullName?: string;
}

/** Accepts either a raw user (from `@CurrentUser()`) or the whole request. */
export type ActorSource = AuthenticatedUser | AuthenticatedRequest | undefined;

function extractUser(source: ActorSource): AuthenticatedUser | undefined {
  if (!source) return undefined;
  if ('user' in source && source.user) return source.user;
  return source as AuthenticatedUser;
}

/**
 * Normalises the JWT payload roles (which may be strings or role rows) into a
 * plain list of role names.
 */
export function normalizeRoles(roles: AuthenticatedUser['roles']): string[] {
  if (!roles || roles.length === 0) return [];
  return roles.map((role) => (typeof role === 'string' ? role : role.name));
}

/**
 * Converts an authenticated request/user into the `Actor` shape consumed by
 * tenant-scoped services. Returns `undefined` for public (unauthenticated)
 * endpoints so callers can skip ownership checks.
 */
export function toActor(source: ActorSource): Actor | undefined {
  const user = extractUser(source);
  if (!user?.id) return undefined;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

  return {
    id: user.id,
    roles: normalizeRoles(user.roles),
    fullName: fullName || undefined,
  };
}
