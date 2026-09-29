export enum RiderAvailability {
  /** Rider is not taking any new delivery assignments. */
  OFFLINE = 'OFFLINE',
  /** Rider is online and eligible for new delivery assignments. */
  AVAILABLE = 'AVAILABLE',
  /** Rider is currently executing an accepted delivery. */
  BUSY = 'BUSY',
}
