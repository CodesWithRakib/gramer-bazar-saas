/**
 * Lifecycle of a medicine batch. Kept as an explicit enum (never magic strings)
 * so expiry/FEFO logic and the UI can rely on a single source of truth.
 */
export enum BatchStatus {
  /** Sellable and not expired. */
  ACTIVE = 'ACTIVE',
  /** Past its expiry date — must never be sold. */
  EXPIRED = 'EXPIRED',
  /** Withheld by admin/seller (recall, quality hold…). */
  BLOCKED = 'BLOCKED',
  /** Fully consumed; retained for audit history. */
  DEPLETED = 'DEPLETED',
}
