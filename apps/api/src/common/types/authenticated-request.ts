/**
 * Shape of the authenticated request attached by `JwtAuthGuard`.
 *
 * `roles` may be hydrated either as raw role names or as role rows, so both
 * forms are accepted and normalised through `toActor`.
 */
export interface AuthenticatedUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roles?: Array<string | { name: string }>;
}

export interface AuthenticatedRequest {
  user: AuthenticatedUser;
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
}
