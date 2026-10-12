import { Injectable, Logger } from '@nestjs/common';
import { SmsProvider, SmsSendResult } from './sms-provider.interface.js';

@Injectable()
export class MockSmsProvider implements SmsProvider {
  readonly name = 'mock';
  private readonly logger = new Logger(MockSmsProvider.name);

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    this.logger.log(`[MOCK SMS] Transmitting to "${to}": "${message}"`);
    return {
      success: true,
      provider: this.name,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
  }
}
