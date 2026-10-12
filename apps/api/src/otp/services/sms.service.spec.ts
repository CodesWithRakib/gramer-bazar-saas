import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service.js';
import { MockSmsProvider } from '../providers/mock-sms.provider.js';
import { GreenwebSmsProvider } from '../providers/greenweb-sms.provider.js';
import { BulkSmsbdProvider } from '../providers/bulksmsbd-sms.provider.js';

describe('SmsService', () => {
  let smsService: SmsService;
  let configService: ConfigService;
  let mockProvider: MockSmsProvider;
  let greenwebProvider: GreenwebSmsProvider;
  let bulksmsbdProvider: BulkSmsbdProvider;

  beforeEach(() => {
    configService = {
      get: vi.fn((key: string) => {
        if (key === 'SMS_PROVIDER') return 'mock';
        return undefined;
      }),
    } as unknown as ConfigService;

    mockProvider = new MockSmsProvider();
    greenwebProvider = new GreenwebSmsProvider(configService);
    bulksmsbdProvider = new BulkSmsbdProvider(configService);

    smsService = new SmsService(
      configService,
      mockProvider,
      greenwebProvider,
      bulksmsbdProvider,
    );
  });

  it('should be defined', () => {
    expect(smsService).toBeDefined();
  });

  it('should return mock provider by default', () => {
    const provider = smsService.getActiveProvider();
    expect(provider.name).toBe('mock');
  });

  it('should select greenweb provider when configured', () => {
    vi.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'SMS_PROVIDER') return 'greenweb';
      return undefined;
    });

    const provider = smsService.getActiveProvider();
    expect(provider.name).toBe('greenweb');
  });

  it('should select bulksmsbd provider when configured', () => {
    vi.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'SMS_PROVIDER') return 'bulksmsbd';
      return undefined;
    });

    const provider = smsService.getActiveProvider();
    expect(provider.name).toBe('bulksmsbd');
  });

  it('should fall back to mock provider when unknown provider is specified', () => {
    vi.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'SMS_PROVIDER') return 'invalid_provider';
      return undefined;
    });

    const provider = smsService.getActiveProvider();
    expect(provider.name).toBe('mock');
  });

  it('should format Bangla OTP message and dispatch via active provider', async () => {
    const sendSpy = vi.spyOn(mockProvider, 'sendSms');
    const result = await smsService.sendOtpSms('01700000000', '123456', 'bn');

    expect(result.success).toBe(true);
    expect(sendSpy).toHaveBeenCalledWith(
      '01700000000',
      expect.stringContaining('গ্রামের বাজার: আপনার ওটিপি (OTP) কোড হলো 123456'),
    );
  });

  it('should format English OTP message when lang is en', async () => {
    const sendSpy = vi.spyOn(mockProvider, 'sendSms');
    const result = await smsService.sendOtpSms('01700000000', '654321', 'en');

    expect(result.success).toBe(true);
    expect(sendSpy).toHaveBeenCalledWith(
      '01700000000',
      expect.stringContaining('Gramer Bazar: Your verification OTP is 654321'),
    );
  });
});
