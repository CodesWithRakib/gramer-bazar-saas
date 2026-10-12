import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common';

import { WhatsAppWebhookController } from './whatsapp-webhook.controller.js';
import { BroadcastCampaignsService } from '../services/broadcast-campaigns.service.js';

describe('WhatsAppWebhookController', () => {
  let controller: WhatsAppWebhookController;
  let configService: ConfigService;
  let campaignsService: Partial<BroadcastCampaignsService>;

  beforeEach(() => {
    configService = new ConfigService();
    campaignsService = {
      handleProviderReceipt: vi.fn().mockResolvedValue({ updated: true, recipientId: 'rec-1' }),
    };
    controller = new WhatsAppWebhookController(
      configService,
      campaignsService as BroadcastCampaignsService,
    );
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = 'my-verify-token-123';
  });

  describe('verifyWebhook (GET)', () => {
    it('returns challenge string on valid mode and token', () => {
      const challenge = 'challenge_code_98765';
      const result = controller.verifyWebhook('subscribe', 'my-verify-token-123', challenge);
      expect(result).toBe(challenge);
    });

    it('throws ForbiddenException when verify token mismatches', () => {
      expect(() =>
        controller.verifyWebhook('subscribe', 'wrong-token', 'challenge_code_98765'),
      ).toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when mode is not subscribe', () => {
      expect(() =>
        controller.verifyWebhook('other_mode', 'my-verify-token-123', 'challenge_code_98765'),
      ).toThrow(ForbiddenException);
    });
  });

  describe('handleWebhookPayload (POST)', () => {
    it('processes status updates from incoming Meta webhook payload', async () => {
      const payload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'entry-1',
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  statuses: [
                    {
                      id: 'wamid.HBgL123456',
                      status: 'delivered',
                      timestamp: '1700000000',
                      recipient_id: '8801712345678',
                    },
                    {
                      id: 'wamid.HBgL789012',
                      status: 'read',
                      timestamp: '1700000010',
                      recipient_id: '8801712345679',
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const result = await controller.handleWebhookPayload(payload);
      expect(result).toEqual({ status: 'success' });
      expect(campaignsService.handleProviderReceipt).toHaveBeenCalledTimes(2);
      expect(campaignsService.handleProviderReceipt).toHaveBeenCalledWith(
        'wamid.HBgL123456',
        'delivered',
        undefined,
      );
      expect(campaignsService.handleProviderReceipt).toHaveBeenCalledWith(
        'wamid.HBgL789012',
        'read',
        undefined,
      );
    });

    it('ignores payloads with unexpected structures gracefully without crashing', async () => {
      const result = await controller.handleWebhookPayload({ unknown: true });
      expect(result).toEqual({ status: 'ignored' });
      expect(campaignsService.handleProviderReceipt).not.toHaveBeenCalled();
    });
  });
});
