/**
 * Documented reasons a Super Admin may start an impersonation session.
 * A free-form note is required when the reason is OTHER.
 */
export enum ImpersonationReason {
  QA_TESTING = 'QA_TESTING',
  BUG_INVESTIGATION = 'BUG_INVESTIGATION',
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
  ACCOUNT_VERIFICATION = 'ACCOUNT_VERIFICATION',
  TROUBLESHOOTING = 'TROUBLESHOOTING',
  OTHER = 'OTHER',
}

/**
 * Lifecycle of an impersonation session.
 *
 * - ACTIVE  : session is valid and can be used
 * - ENDED   : the Super Admin exited cleanly (reversible)
 * - EXPIRED : the session outlived its allowed duration
 */
export enum ImpersonationStatus {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  EXPIRED = 'EXPIRED',
}
