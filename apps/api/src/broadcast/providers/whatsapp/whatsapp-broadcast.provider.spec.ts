import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfigService } from '@nestjs/config';

import { WhatsAppBroadcastProvider } from './whatsapp-broadcast.provider.js';
import { BroadcastProviderMessageStatus } from '../../enums/broadcast.enums.js';

describe('WhatsAppBroadcastProvider', () => {
  let provider: WhatsAppBroadcastProvider;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
    provider = new WhatsAppBroadcastProvider(configService);
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports not ready if credentials are missing', async () => {
    const ready = await provider.isReady();
    expect(ready).toBe(false);
  });

  it('reports ready when access token and phone number ID are configured', async () => {
    process.env.WHATSAPP_ACCESS_TOKEN = 'test-token';
    process.env.WHATSAPP_PHONE_NUMBER_ID = '1234567890';
    const ready = await provider.isReady();
    expect(ready).toBe(true);
  });

  it('safely falls back to simulated send when credentials are not provided', async () => {
    const result = await provider.sendMessage({
      recipientId: 'rec-1',
      to: '01712345678',
      body: 'Test announcement',
      idempotencyKey: 'idemp-1',
    });

    expect(result.simulated).toBe(true);
    expect(result.status).toBe(BroadcastProviderMessageStatus.SENT);
    expect(result.providerMessageId).toMatch(/^sim-wa-/);
  });

  it('makes live Meta Graph API call and handles success response', async () => {
    process.env.WHATSAPP_ACCESS_TOKEN = 'live-token-123';
    process.env.WHATSAPP_PHONE_NUMBER_ID = '987654321';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        messaging_product: 'whatsapp',
        contacts: [{ input: '8801712345678', wa_id: '8801712345678' }],
        messages: [{ id: 'wamid.HBgL123456' }],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await provider.sendMessage({
      recipientId: 'rec-2',
      to: '01712345678',
      body: 'Seasonal Mango Offer',
      template: {
        providerTemplateId: 'mango_promo_2026',
        language: 'bn',
        variables: { name: 'Rahim', discount: '20%' },
      },
      idempotencyKey: 'idemp-2',
    });

    expect(result.simulated).toBe(false);
    expect(result.status).toBe(BroadcastProviderMessageStatus.SENT);
    expect(result.providerMessageId).toBe('wamid.HBgL123456');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('987654321/messages');
    expect(options.headers.Authorization).toBe('Bearer live-token-123');

    const sentBody = JSON.parse(options.body);
    expect(sentBody.to).toBe('8801712345678');
    expect(sentBody.type).toBe('template');
    expect(sentBody.template.name).toBe('mango_promo_2026');
  });

  it('handles rate-limited response and flags it as retryable', async () => {
    process.env.WHATSAPP_ACCESS_TOKEN = 'live-token-123';
    process.env.WHATSAPP_PHONE_NUMBER_ID = '987654321';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({
        error: {
          message: 'Rate limit hit',
          code: 130429,
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await provider.sendMessage({
      recipientId: 'rec-3',
      to: '01712345678',
      body: 'Rate limited message',
      idempotencyKey: 'idemp-3',
    });

    expect(result.status).toBe(BroadcastProviderMessageStatus.FAILED);
    expect(result.retryable).toBe(true);
    expect(result.failureReason).toContain('Rate limit hit');
  });

  it('handles non-retryable invalid recipient error', async () => {
    process.env.WHATSAPP_ACCESS_TOKEN = 'live-token-123';
    process.env.WHATSAPP_PHONE_NUMBER_ID = '987654321';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({
        error: {
          message: 'Recipient phone number is not a valid WhatsApp user',
          code: 131026,
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await provider.sendMessage({
      recipientId: 'rec-4',
      to: '01712345678',
      body: 'Invalid recipient',
      idempotencyKey: 'idemp-4',
    });

    expect(result.status).toBe(BroadcastProviderMessageStatus.FAILED);
    expect(result.retryable).toBe(false);
  });
});
