import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SmsProvider, SmsSendResult } from './sms-provider.interface.js';

@Injectable()
export class GreenwebSmsProvider implements SmsProvider {
  readonly name = 'greenweb';
  private readonly logger = new Logger(GreenwebSmsProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    const token = this.configService.get<string>('GREENWEB_TOKEN');
    const apiUrl =
      this.configService.get<string>('GREENWEB_URL') || 'https://api.greenweb.com.bd/api.php';

    if (!token) {
      this.logger.error('GREENWEB_TOKEN is not configured.');
      return {
        success: false,
        provider: this.name,
        error: 'GREENWEB_TOKEN is missing',
      };
    }

    // Normalize phone number to 8801XXXXXXXXX format (without leading '+')
    let formattedPhone = to.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('01') && formattedPhone.length === 11) {
      formattedPhone = `88${formattedPhone}`;
    }

    try {
      const response = await axios.post(
        apiUrl,
        new URLSearchParams({
          token,
          to: formattedPhone,
          message,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        },
      );

      const responseData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

      if (
        response.status === 200 &&
        (responseData.toLowerCase().includes('ok') || responseData.toLowerCase().includes('success'))
      ) {
        this.logger.log(`Greenweb SMS sent successfully to ${formattedPhone}`);
        return {
          success: true,
          provider: this.name,
          messageId: `gw_${Date.now()}`,
        };
      }

      this.logger.warn(`Greenweb SMS failed with response: ${responseData}`);
      return {
        success: false,
        provider: this.name,
        error: responseData,
      };
    } catch (err) {
      const errorMsg = (err as Error).message;
      this.logger.error(`Error sending SMS via Greenweb: ${errorMsg}`, (err as Error).stack);
      return {
        success: false,
        provider: this.name,
        error: errorMsg,
      };
    }
  }
}
