import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

import { BroadcastProviderName } from '../../enums/broadcast.enums.js';
import type {
  BroadcastMessageInput,
  BroadcastProvider,
  BroadcastSendResult,
} from '../broadcast-provider.interface.js';

/**
 * FUTURE REAL PROVIDER — INTENTIONALLY NOT IMPLEMENTED YET.
 *
 * This placeholder defines the integration boundary for the WhatsApp Business /
 * Cloud API. It is registered so the system can be switched to it via the
 * BROADCAST_PROVIDER environment variable once implemented, without touching
 * any other part of the application.
 *
 * To implement:
 *   1. Read credentials from configuration (never hardcode):
 *        WHATSAPP_ACCESS_TOKEN
 *        WHATSAPP_PHONE_NUMBER_ID
 *        WHATSAPP_BUSINESS_ACCOUNT_ID
 *        WHATSAPP_API_BASE_URL
 *   2. Map BroadcastMessageInput.template.providerTemplateId to an APPROVED
 *      WhatsApp template name + language (see docs/broadcast/WHATSAPP_INTEGRATION.md).
 *   3. POST to /{phone-number-id}/messages, handle provider error codes, and
 *      return the provider message id in BroadcastSendResult.
 *   4. Add a WhatsAppWebhookController that verifies inbound events and advances
 *      recipient SENT/DELIVERED/READ/FAILED through BroadcastService.
 *
 * TODO(WHATSAPP): implement the real provider here. Verify current Meta/WhatsApp
 * documentation, template approval, pricing, webhook and messaging policy
 * requirements before doing so.
 */
@Injectable()
export class WhatsAppBroadcastProvider implements BroadcastProvider {
  readonly name = BroadcastProviderName.WHATSAPP;
  readonly simulated = false;

  private readonly logger = new Logger(WhatsAppBroadcastProvider.name);

  async sendMessage(_input: BroadcastMessageInput): Promise<BroadcastSendResult> {
    // TODO(WHATSAPP): implement the real Cloud API call.
    this.logger.error(
      'WhatsAppBroadcastProvider is not implemented. Configure BROADCAST_PROVIDER=mock until the integration is complete.',
    );
    throw new ServiceUnavailableException(
      'WhatsApp broadcast provider is not implemented yet. Use the mock provider.',
    );
  }

  async isReady(): Promise<boolean> {
    return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  }
}
