import type {
  BroadcastProviderMessageStatus,
  BroadcastProviderName,
} from '../enums/broadcast.enums.js';

/**
 * Provider-agnostic input for sending one broadcast message.
 *
 * Every field here is what ANY provider would need (recipient, phone, rendered
 * body, optional approved template reference). Nothing WhatsApp-specific leaks
 * into the domain layer.
 */
export interface BroadcastMessageInput {
  /** Local broadcast_recipients.id — used for tracing, never for provider calls. */
  recipientId: string;
  /** Recipient phone in E.164-ish form. */
  to: string;
  /** Rendered, personalized message body. */
  body: string;
  /**
   * Reference to a provider-approved template, when the provider requires one
   * (WhatsApp does for many message types). The mock provider ignores this.
   */
  template?: {
    providerTemplateId?: string | null;
    name?: string | null;
    language?: string;
    variables?: Record<string, string>;
  } | null;
  /**
   * Idempotency key so a retried send cannot produce a duplicate message.
   * Providers that support idempotency should pass it through.
   */
  idempotencyKey: string;
  /** Free-form metadata for logging/analytics. Never contains secrets. */
  metadata?: Record<string, string>;
}

export interface BroadcastSendResult {
  /** Provider-assigned message id (simulated for the mock provider). */
  providerMessageId: string;
  status: BroadcastProviderMessageStatus;
  /**
   * True when the result is simulated (mock/development provider). Callers must
   * never present simulated delivery as real WhatsApp delivery.
   */
  simulated: boolean;
  /** Populated when status === FAILED. */
  failureReason?: string;
  /** Whether the provider considers this failure retryable. */
  retryable?: boolean;
}

/**
 * Contract every broadcast delivery provider must implement.
 *
 * Only provider-specific code lives behind this interface. Template management,
 * audience management, campaign lifecycle, scheduling, recipient tracking,
 * analytics and the admin UI all remain provider-independent.
 *
 * TODO(WHATSAPP): implement `WhatsAppBroadcastProvider` and register it in
 * `BroadcastProviderRegistry`. See docs/broadcast/WHATSAPP_INTEGRATION.md.
 */
export interface BroadcastProvider {
  /** Stable provider identifier. */
  readonly name: BroadcastProviderName;

  /** True when messages are simulated and do not leave the platform. */
  readonly simulated: boolean;

  /** Send a single message. */
  sendMessage(input: BroadcastMessageInput): Promise<BroadcastSendResult>;

  /**
   * Optional capability probe used by the admin UI to surface provider health.
   * The mock provider always reports ready.
   */
  isReady?(): Promise<boolean>;
}
