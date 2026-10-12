import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SmsProvider, SmsSendResult } from './sms-provider.interface.js';

@Injectable()
export class BulkSmsbdProvider implements SmsProvider {
  readonly name = 'bulksmsbd';
  private readonly logger = new Logger(BulkSmsbdProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    const apiKey = this.configService.get<string>('BULKSMSBD_API_KEY');
    const senderId = this.configService.get<string>('BULKSMSBD_SENDER_ID') || '8809617612345';
    const apiUrl =
      this.configService.get<string>('BULKSMSBD_URL') || 'http://bulksmsbd.net/api/smsapi';

    if (!apiKey) {
      this.logger.error('BULKSMSBD_API_KEY is not configured.');
      return {
        success: false,
        provider: this.name,
        error: 'BULKSMSBD_API_KEY is missing',
      };
    }

    // Normalize phone number to 8801XXXXXXXXX or 01XXXXXXXXX
    let formattedPhone = to.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('01') && formattedPhone.length === 11) {
      formattedPhone = `88${formattedPhone}`;
    }

    try {
      const response = await axios.post(
        apiUrl,
        {
          api_key: apiKey,
          type: 'text',
          number: formattedPhone,
          senderid: senderId,
          message,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      const data = response.data;
      // BulkSMSBD standard success code is 202
      if (data && (data.response_code === 202 || data.response_code === '202')) {
        this.logger.log(`BulkSMSBD SMS sent successfully to ${formattedPhone}`);
        return {
          success: true,
          provider: this.name,
          messageId: data.message_id ? String(data.message_id) : `bsms_${Date.now()}`,
        };
      }

      const errorMsg = data?.error_message || JSON.stringify(data);
      this.logger.warn(`BulkSMSBD SMS rejected: ${errorMsg}`);
      return {
        success: false,
        provider: this.name,
        error: errorMsg,
      };
    } catch (err) {
      const errorMsg = (err as Error).message;
      this.logger.error(`Error sending SMS via BulkSMSBD: ${errorMsg}`, (err as Error).stack);
      return {
        success: false,
        provider: this.name,
        error: errorMsg,
      };
    }
  }
}
