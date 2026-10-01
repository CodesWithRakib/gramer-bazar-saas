import type { PermissionBearingUser } from './permission.js';

/**
 * Impersonation context attached to `req.user` by the JWT strategy when the
 * request is authenticated with a temporary impersonation token.
 *
 * ACTOR          = the real, authenticated Super Admin.
 * EFFECTIVE USER = the target whose experience is being viewed.
 */
export interface ImpersonationPrincipal {
  sessionId: string;
  actorUserId: string;
  actorName: string | null;
  actorRoles: string[];
  targetUserId: string;
  targetName: string | null;
  targetRole: string;
  reason: string;
  reasonNote: string | null;
  startedAt: string;
  expiresAt: string;
}

export interface AuthenticatedPrincipal extends PermissionBearingUser {
  id: string;
  impersonation?: ImpersonationPrincipal | null;
}

/** True when the current request is being served under an impersonation token. */
export function isImpersonating(user?: AuthenticatedPrincipal | null): boolean {
  return Boolean(user?.impersonation);
}

/** Extract the impersonation context, or null for a normal session. */
export function getImpersonationContext(
  user?: AuthenticatedPrincipal | null,
): ImpersonationPrincipal | null {
  return user?.impersonation ?? null;
}
