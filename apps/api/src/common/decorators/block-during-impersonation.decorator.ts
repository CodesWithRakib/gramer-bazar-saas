import { SetMetadata } from '@nestjs/common';

export const BLOCK_DURING_IMPERSONATION_KEY = 'block_during_impersonation';

/**
 * Marks an endpoint as forbidden while the request is authenticated with an
 * impersonation token. Use this for security-sensitive operations (password,
 * contact/security settings, account deletion, financial requests) so that a
 * Super Admin cannot silently perform them "as" the target user.
 *
 * This is enforced server-side by `ImpersonationGuard`; hiding the control in
 * the frontend is never sufficient.
 */
export const BlockDuringImpersonation = () => SetMetadata(BLOCK_DURING_IMPERSONATION_KEY, true);
