/**
 * Broadcast & Marketing Communication enums.
 *
 * These are provider-independent. WhatsApp-specific concepts (template
 * approval status, provider categories) are modelled as optional metadata so a
 * real WhatsApp Business/Cloud API provider can be plugged in later without
 * changing the rest of the system.
 */

/** Which delivery provider a template/campaign is configured to use. */
export enum BroadcastProviderName {
  /** Development provider that simulates delivery. No real message is sent. */
  MOCK = 'MOCK',
  /**
   * Future real WhatsApp Business/Cloud API provider.
   * NOT IMPLEMENTED YET — see docs/broadcast/WHATSAPP_INTEGRATION.md.
   */
  WHATSAPP = 'WHATSAPP',
}

/** WhatsApp-style template categories, kept generic for future providers. */
export enum BroadcastTemplateCategory {
  MARKETING = 'MARKETING',
  UTILITY = 'UTILITY',
  AUTHENTICATION = 'AUTHENTICATION',
}

/** Local template lifecycle. */
export enum BroadcastTemplateStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Template approval status on the provider side. Always LOCAL_ONLY for the mock
 * provider. A real WhatsApp provider will populate PENDING/APPROVED/REJECTED.
 */
export enum BroadcastTemplateProviderStatus {
  LOCAL_ONLY = 'LOCAL_ONLY',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/** Campaign lifecycle: DRAFT → SCHEDULED → PROCESSING → COMPLETED (+ FAILED/CANCELLED). */
export enum BroadcastStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/** Per-recipient delivery lifecycle. */
export enum BroadcastRecipientStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

/** Audience segmentation strategies. Extensible: add cases in the audience resolver. */
export enum BroadcastAudienceType {
  ALL_CUSTOMERS = 'ALL_CUSTOMERS',
  SELECTED_CUSTOMERS = 'SELECTED_CUSTOMERS',
  ACTIVE_CUSTOMERS = 'ACTIVE_CUSTOMERS',
  INACTIVE_CUSTOMERS = 'INACTIVE_CUSTOMERS',
  ORDERED_BEFORE = 'ORDERED_BEFORE',
  NO_RECENT_ORDER = 'NO_RECENT_ORDER',
  AREA_BASED = 'AREA_BASED',
}

/** Result status returned by a broadcast provider. */
export enum BroadcastProviderMessageStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

/** Campaign lifecycle transitions. Used to reject invalid state changes. */
export const BROADCAST_ALLOWED_TRANSITIONS: Record<BroadcastStatus, BroadcastStatus[]> = {
  [BroadcastStatus.DRAFT]: [BroadcastStatus.SCHEDULED, BroadcastStatus.PROCESSING, BroadcastStatus.CANCELLED],
  [BroadcastStatus.SCHEDULED]: [BroadcastStatus.PROCESSING, BroadcastStatus.DRAFT, BroadcastStatus.CANCELLED],
  [BroadcastStatus.PROCESSING]: [BroadcastStatus.COMPLETED, BroadcastStatus.FAILED],
  [BroadcastStatus.COMPLETED]: [],
  [BroadcastStatus.FAILED]: [],
  [BroadcastStatus.CANCELLED]: [],
};

/** Recipient statuses considered terminal (no further processing). */
export const TERMINAL_RECIPIENT_STATUSES: BroadcastRecipientStatus[] = [
  BroadcastRecipientStatus.DELIVERED,
  BroadcastRecipientStatus.READ,
  BroadcastRecipientStatus.FAILED,
];
