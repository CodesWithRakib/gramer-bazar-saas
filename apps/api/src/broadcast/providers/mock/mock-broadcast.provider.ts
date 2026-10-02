import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

import {
  BroadcastProviderMessageStatus,
  BroadcastProviderName,
} from '../../enums/broadcast.enums.js';
import type {
  BroadcastMessageInput,
  BroadcastProvider,
  BroadcastSendResult,
} from '../broadcast-provider.interface.js';

/**
 * DEVELOPMENT / MOCK PROVIDER.
 *
 * Simulates sending. NO real WhatsApp (or any other) message is delivered.
 * Result statuses are simulated and must never be presented to users as real
 * WhatsApp delivery.
 *
 * Behaviour:
 *  - Returns SENT with a synthetic `mock-<uuid>` provider message id.
 *  - A configurable failure rate (BROADCAST_MOCK_FAILURE_RATE, default 0)
 *    produces transient FAILED results so retry handling can be exercised.
 *  - Delivery/read receipts are simulated asynchronously by
 *    BroadcastProcessorService when the provider is simulated.
 *
 * TODO(WHATSAPP): replace this provider with WhatsAppBroadcastProvider in
 * production. Keep BroadcastService provider-agnostic.
 */
@Injectable()
export class MockBroadcastProvider implements BroadcastProvider {
  readonly name = BroadcastProviderName.MOCK;
  readonly simulated = true;

  private readonly logger = new Logger(MockBroadcastProvider.name);

  private getFailureRate(): number {
    const raw = Number(process.env.BROADCAST_MOCK_FAILURE_RATE);
    if (!Number.isFinite(raw) || raw <= 0) return 0;
    return Math.min(raw, 1);
  }

  async sendMessage(input: BroadcastMessageInput): Promise<BroadcastSendResult> {
    const simulatedId = input.template?.providerTemplateId
      ? `${input.template.providerTemplateId}:mock`
      : 'mock';

    const failureRate = this.getFailureRate();
    if (failureRate > 0 && Math.random() < failureRate) {
      this.logger.warn(
        `[MOCK] Simulated transient failure for recipient ${input.recipientId} (${simulatedId})`,
      );
      return {
        providerMessageId: `mock-${randomUUID()}`,
        status: BroadcastProviderMessageStatus.FAILED,
        simulated: true,
        failureReason: 'Simulated provider failure',
        retryable: true,
      };
    }

    // Intentionally NOT logging the message body or recipient phone to keep logs clean.
    return {
      providerMessageId: `mock-${randomUUID()}`,
      status: BroadcastProviderMessageStatus.SENT,
      simulated: true,
    };
  }

  async isReady(): Promise<boolean> {
    return true;
  }
}
