import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsProvider, SmsSendResult } from '../providers/sms-provider.interface.js';
import { MockSmsProvider } from '../providers/mock-sms.provider.js';
import { GreenwebSmsProvider } from '../providers/greenweb-sms.provider.js';
import { BulkSmsbdProvider } from '../providers/bulksmsbd-sms.provider.js';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly providers: Map<string, SmsProvider> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly mockProvider: MockSmsProvider,
    private readonly greenwebProvider: GreenwebSmsProvider,
    private readonly bulksmsbdProvider: BulkSmsbdProvider,
  ) {
    this.providers.set('mock', this.mockProvider);
    this.providers.set('greenweb', this.greenwebProvider);
    this.providers.set('bulksmsbd', this.bulksmsbdProvider);
  }

  /**
   * Retrieves the currently active SMS provider based on environment configuration.
   */
  getActiveProvider(): SmsProvider {
    const providerKey = this.configService.get<string>('SMS_PROVIDER') || 'mock';
    const provider = this.providers.get(providerKey.toLowerCase());
    if (!provider) {
      this.logger.warn(
        `Configured SMS provider "${providerKey}" not found. Falling back to MockSmsProvider.`,
      );
      return this.mockProvider;
    }
    return provider;
  }

  /**
   * Dispatches an OTP verification SMS to the specified phone number.
   */
  async sendOtpSms(phone: string, code: string, lang = 'bn'): Promise<SmsSendResult> {
    const isBn = lang === 'bn';
    const message = isBn
      ? `গ্রামের বাজার: আপনার ওটিপি (OTP) কোড হলো ${code}। মেয়াদ ৫ মিনিট। কাউকে এই কোড বলবেন না।`
      : `Gramer Bazar: Your verification OTP is ${code}. Valid for 5 minutes. Do not share this code.`;

    const provider = this.getActiveProvider();
    this.logger.log(`Dispatching OTP via ${provider.name} to ${phone}`);

    try {
      const result = await provider.sendSms(phone, message);
      if (!result.success) {
        this.logger.warn(
          `SMS dispatch via ${provider.name} failed for ${phone}: ${result.error}`,
        );
      }
      return result;
    } catch (err) {
      const errorMsg = (err as Error).message;
      this.logger.error(`Unhandled error during SMS dispatch: ${errorMsg}`, (err as Error).stack);
      return {
        success: false,
        provider: provider.name,
        error: errorMsg,
      };
    }
  }

  /**
   * Dispatches a general notification or status SMS.
   */
  async sendNotificationSms(phone: string, message: string): Promise<SmsSendResult> {
    const provider = this.getActiveProvider();
    return provider.sendSms(phone, message);
  }
}
