import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { BroadcastCampaignsService } from '../services/broadcast-campaigns.service.js';

@ApiTags('Broadcast — Webhooks')
@Controller('broadcast/webhooks/whatsapp')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly campaignsService: BroadcastCampaignsService,
  ) {}

  private get expectedVerifyToken(): string {
    return (
      this.configService.get<string>('broadcast.whatsapp.webhookVerifyToken') ||
      process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
      'gramer-bazar-whatsapp-verify'
    );
  }

  /**
   * Meta Webhook Verification Challenge endpoint.
   * Called by Meta when configuring the WhatsApp Cloud API webhook.
   */
  @Get()
  @ApiOperation({ summary: 'Verify Meta WhatsApp Webhook' })
  verifyWebhook(
    @Query('hub.mode') mode?: string,
    @Query('hub.verify_token') token?: string,
    @Query('hub.challenge') challenge?: string,
  ): string {
    if (mode === 'subscribe' && token === this.expectedVerifyToken) {
      this.logger.log('Meta WhatsApp Webhook subscription verified successfully.');
      return challenge ?? '';
    }

    this.logger.warn(
      `Meta WhatsApp Webhook verification failed: mode=${mode}, token mismatch`,
    );
    throw new ForbiddenException('Invalid webhook verification token');
  }

  /**
   * Receives incoming delivery status receipts from Meta WhatsApp Cloud API.
   * Updates recipients through monotonic state transitions (SENT -> DELIVERED -> READ, or FAILED).
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle WhatsApp delivery receipt events' })
  async handleWebhookPayload(@Body() payload: Record<string, any>): Promise<{ status: string }> {
    try {
      const entries = payload?.entry;
      if (!Array.isArray(entries)) {
        return { status: 'ignored' };
      }

      for (const entry of entries) {
        const changes = entry?.changes;
        if (!Array.isArray(changes)) continue;

        for (const change of changes) {
          if (change?.field !== 'messages') continue;

          const statuses = change?.value?.statuses;
          if (!Array.isArray(statuses)) continue;

          for (const statusObj of statuses) {
            const providerMessageId = statusObj?.id;
            const status = statusObj?.status;
            const errorReason =
              statusObj?.errors?.[0]?.message ||
              statusObj?.errors?.[0]?.title ||
              undefined;

            if (providerMessageId && status) {
              await this.campaignsService.handleProviderReceipt(
                providerMessageId,
                status,
                errorReason,
              );
            }
          }
        }
      }

      return { status: 'success' };
    } catch (err: any) {
      this.logger.error(`Failed to process WhatsApp webhook payload: ${err?.message}`);
      return { status: 'error' };
    }
  }
}
