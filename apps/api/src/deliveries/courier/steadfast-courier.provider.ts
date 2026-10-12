import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  CourierProvider,
  CourierBookingRequest,
  CourierBookingResponse,
  CourierTrackingResponse,
} from './courier.interface.js';

@Injectable()
export class SteadfastCourierProvider implements CourierProvider {
  readonly name = 'STEADFAST';
  private readonly logger = new Logger(SteadfastCourierProvider.name);

  constructor(private readonly configService: ConfigService) {}

  private getCredentials() {
    const apiKey = this.configService.get<string>('STEADFAST_API_KEY');
    const secretKey = this.configService.get<string>('STEADFAST_SECRET_KEY');
    const baseUrl =
      this.configService.get<string>('STEADFAST_BASE_URL') ||
      'https://portal.steadfast.com.bd/api/v1';

    return { apiKey, secretKey, baseUrl };
  }

  async bookParcel(request: CourierBookingRequest): Promise<CourierBookingResponse> {
    const { apiKey, secretKey, baseUrl } = this.getCredentials();

    if (!apiKey || !secretKey) {
      this.logger.error('Steadfast API credentials are not configured.');
      return {
        success: false,
        provider: this.name,
        status: 'error',
        error: 'STEADFAST_API_KEY or STEADFAST_SECRET_KEY is missing',
      };
    }

    try {
      const response = await axios.post(
        `${baseUrl}/create_order`,
        {
          invoice: request.invoice,
          recipient_name: request.recipientName,
          recipient_phone: request.recipientPhone,
          recipient_address: request.recipientAddress,
          cod_amount: request.codAmount,
          note: request.note || 'Gramer Bazar delivery',
        },
        {
          headers: {
            'Api-Key': apiKey,
            'Secret-Key': secretKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      const data = response.data;
      if (data && (data.status === 200 || data.status === '200') && data.consignment) {
        this.logger.log(
          `Steadfast parcel booked successfully. Tracking: ${data.consignment.tracking_code}`,
        );
        return {
          success: true,
          provider: this.name,
          consignmentId: String(data.consignment.consignment_id),
          trackingCode: data.consignment.tracking_code,
          status: data.consignment.status || 'in_review',
        };
      }

      const errorMsg = data?.errors || data?.message || 'Failed to book Steadfast parcel';
      this.logger.warn(`Steadfast booking error: ${JSON.stringify(errorMsg)}`);
      return {
        success: false,
        provider: this.name,
        status: 'rejected',
        error: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
      };
    } catch (err) {
      const errorMsg = (err as Error).message;
      this.logger.error(`Error booking Steadfast order: ${errorMsg}`, (err as Error).stack);
      return {
        success: false,
        provider: this.name,
        status: 'error',
        error: errorMsg,
      };
    }
  }

  async trackParcel(trackingCode: string): Promise<CourierTrackingResponse> {
    const { apiKey, secretKey, baseUrl } = this.getCredentials();

    if (!apiKey || !secretKey) {
      return {
        success: false,
        provider: this.name,
        trackingCode,
        status: 'unknown',
        error: 'Steadfast credentials missing',
      };
    }

    try {
      const response = await axios.get(`${baseUrl}/status_by_trackingcode/${trackingCode}`, {
        headers: {
          'Api-Key': apiKey,
          'Secret-Key': secretKey,
        },
        timeout: 10000,
      });

      const data = response.data;
      if (data && (data.status === 200 || data.status === '200')) {
        return {
          success: true,
          provider: this.name,
          trackingCode,
          status: data.delivery_status || 'unknown',
          rawDetails: data,
        };
      }

      return {
        success: false,
        provider: this.name,
        trackingCode,
        status: 'unknown',
        error: data?.message || 'Unable to retrieve tracking info',
      };
    } catch (err) {
      return {
        success: false,
        provider: this.name,
        trackingCode,
        status: 'unknown',
        error: (err as Error).message,
      };
    }
  }
}
