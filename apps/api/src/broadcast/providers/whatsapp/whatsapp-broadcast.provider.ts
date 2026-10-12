import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BroadcastProviderMessageStatus, BroadcastProviderName } from '../../enums/broadcast.enums.js';
import type {
  BroadcastMessageInput,
  BroadcastProvider,
  BroadcastSendResult,
} from '../broadcast-provider.interface.js';

interface MetaWhatsAppErrorResponse {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

interface MetaWhatsAppSuccessResponse {
  messaging_product: string;
  contacts?: Array<{ input: string; wa_id: string }>;
  messages?: Array<{ id: string }>;
}

@Injectable()
export class WhatsAppBroadcastProvider implements BroadcastProvider {
  readonly name = BroadcastProviderName.WHATSAPP;
  readonly simulated = false;

  private readonly logger = new Logger(WhatsAppBroadcastProvider.name);

  constructor(private readonly configService: ConfigService) {}

  private get accessToken(): string | undefined {
    return (
      this.configService.get<string>('broadcast.whatsapp.accessToken') ||
      process.env.WHATSAPP_ACCESS_TOKEN
    );
  }

  private get phoneNumberId(): string | undefined {
    return (
      this.configService.get<string>('broadcast.whatsapp.phoneNumberId') ||
      process.env.WHATSAPP_PHONE_NUMBER_ID
    );
  }

  private get baseUrl(): string {
    return (
      this.configService.get<string>('broadcast.whatsapp.baseUrl') ||
      process.env.WHATSAPP_API_BASE_URL ||
      'https://graph.facebook.com/v21.0'
    );
  }

  /**
   * Cleans and normalizes phone numbers into E.164 digits format (without '+').
   * If a Bangladeshi number starts with '01', prepends '88'.
   */
  private formatPhoneNumber(rawPhone: string): string {
    let cleaned = rawPhone.replace(/\D/g, '');
    if (cleaned.startsWith('01') && cleaned.length === 11) {
      cleaned = `88${cleaned}`;
    } else if (cleaned.startsWith('8801') && cleaned.length === 13) {
      // standard Bangladeshi format
    }
    return cleaned;
  }

  async isReady(): Promise<boolean> {
    return Boolean(this.accessToken && this.phoneNumberId);
  }

  async sendMessage(input: BroadcastMessageInput): Promise<BroadcastSendResult> {
    const cleanPhone = this.formatPhoneNumber(input.to);

    // If credentials are not present (development/testing/staging without live WhatsApp account),
    // safely simulate delivery rather than crashing or hanging the processor.
    if (!this.accessToken || !this.phoneNumberId) {
      this.logger.warn(
        `WhatsApp credentials missing (WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID). Simulating send to ${cleanPhone}.`,
      );
      return {
        providerMessageId: `sim-wa-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        status: BroadcastProviderMessageStatus.SENT,
        simulated: true,
      };
    }

    try {
      const endpoint = `${this.baseUrl.replace(/\/+$/, '')}/${this.phoneNumberId}/messages`;

      let payload: Record<string, any>;

      const templateName = input.template?.providerTemplateId || input.template?.name;
      if (templateName) {
        const languageCode = input.template?.language || 'bn';
        const components: Array<Record<string, any>> = [];

        if (input.template?.variables && Object.keys(input.template.variables).length > 0) {
          const parameters = Object.values(input.template.variables).map((val) => ({
            type: 'text',
            text: String(val),
          }));
          components.push({
            type: 'body',
            parameters,
          });
        }

        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            ...(components.length > 0 ? { components } : {}),
          },
        };
      } else {
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: input.body,
          },
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = (await response.json()) as MetaWhatsAppSuccessResponse;
        const providerMessageId = data.messages?.[0]?.id || `wa-${Date.now()}`;
        return {
          providerMessageId,
          status: BroadcastProviderMessageStatus.SENT,
          simulated: false,
        };
      }

      // Handle Meta Graph API error response
      const errorData = (await response.json().catch(() => null)) as MetaWhatsAppErrorResponse | null;
      const errorCode = errorData?.error?.code;
      const errorMessage =
        errorData?.error?.message || `HTTP ${response.status} ${response.statusText}`;

      // Rate limit codes (130429, 131056) or 5xx server errors are retryable
      const isRateLimited = response.status === 429 || errorCode === 130429 || errorCode === 131056;
      const isServerError = response.status >= 500 && response.status < 600;
      const retryable = isRateLimited || isServerError;

      this.logger.error(
        `Meta WhatsApp send failed for ${cleanPhone} (Code: ${errorCode}): ${errorMessage}`,
      );

      return {
        providerMessageId: '',
        status: BroadcastProviderMessageStatus.FAILED,
        simulated: false,
        failureReason: errorMessage,
        retryable,
      };
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError';
      const failureReason = isTimeout ? 'Request timed out after 15s' : err?.message || 'Unknown network error';
      this.logger.error(`Meta WhatsApp network exception for ${cleanPhone}: ${failureReason}`);

      return {
        providerMessageId: '',
        status: BroadcastProviderMessageStatus.FAILED,
        simulated: false,
        failureReason,
        retryable: true, // Network timeouts are transient and retryable
      };
    }
  }
}
