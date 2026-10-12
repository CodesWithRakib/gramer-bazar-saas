import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GreenwebSmsProvider } from './greenweb-sms.provider.js';
import { BulkSmsbdProvider } from './bulksmsbd-sms.provider.js';

vi.mock('axios');

describe('Sms Providers', () => {
  let configService: ConfigService;

  beforeEach(() => {
    vi.clearAllMocks();
    configService = {
      get: vi.fn((key: string) => {
        if (key === 'GREENWEB_TOKEN') return 'test_gw_token';
        if (key === 'BULKSMSBD_API_KEY') return 'test_bsms_key';
        return undefined;
      }),
    } as unknown as ConfigService;
  });

  describe('GreenwebSmsProvider', () => {
    it('should report error if GREENWEB_TOKEN is missing', async () => {
      vi.spyOn(configService, 'get').mockReturnValue(undefined);
      const provider = new GreenwebSmsProvider(configService);

      const result = await provider.sendSms('01700000000', 'Test');
      expect(result.success).toBe(false);
      expect(result.error).toContain('GREENWEB_TOKEN is missing');
    });

    it('should format BD phone and parse successful Greenweb response', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce({
        status: 200,
        data: 'Ok: 1 SMS Sent successfully',
      });

      const provider = new GreenwebSmsProvider(configService);
      const result = await provider.sendSms('01700000000', 'Your code is 123456');

      expect(result.success).toBe(true);
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.greenweb.com.bd/api.php',
        expect.stringContaining('to=8801700000000'),
        expect.any(Object),
      );
    });
  });

  describe('BulkSmsbdProvider', () => {
    it('should report error if BULKSMSBD_API_KEY is missing', async () => {
      vi.spyOn(configService, 'get').mockReturnValue(undefined);
      const provider = new BulkSmsbdProvider(configService);

      const result = await provider.sendSms('01700000000', 'Test');
      expect(result.success).toBe(false);
      expect(result.error).toContain('BULKSMSBD_API_KEY is missing');
    });

    it('should format BD phone and parse BulkSMSBD response code 202', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce({
        status: 200,
        data: {
          response_code: 202,
          success_message: 'SMS Submitted Successfully',
          message_id: 1234567,
        },
      });

      const provider = new BulkSmsbdProvider(configService);
      const result = await provider.sendSms('01700000000', 'Your code is 123456');

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('1234567');
      expect(axios.post).toHaveBeenCalledWith(
        'http://bulksmsbd.net/api/smsapi',
        expect.objectContaining({
          number: '8801700000000',
          api_key: 'test_bsms_key',
        }),
        expect.any(Object),
      );
    });
  });
});
