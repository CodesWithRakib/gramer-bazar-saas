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
export class PathaoCourierProvider implements CourierProvider {
  readonly name = 'PATHAO';
  private readonly logger = new Logger(PathaoCourierProvider.name);
  private cachedAccessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private readonly configService: ConfigService) {}

  private getCredentials() {
    const clientId = this.configService.get<string>('PATHAO_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PATHAO_CLIENT_SECRET');
    const username = this.configService.get<string>('PATHAO_USERNAME');
    const password = this.configService.get<string>('PATHAO_PASSWORD');
    const storeId = this.configService.get<string>('PATHAO_STORE_ID') || '1';
    const baseUrl =
      this.configService.get<string>('PATHAO_BASE_URL') || 'https://api-hermes.pathao.com';

    return { clientId, clientSecret, username, password, storeId, baseUrl };
  }

  private async getAccessToken(): Promise<string | null> {
    if (this.cachedAccessToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedAccessToken;
    }

    const { clientId, clientSecret, username, password, baseUrl } = this.getCredentials();

    if (!clientId || !clientSecret || !username || !password) {
      return null;
    }

    try {
      const response = await axios.post(`${baseUrl}/aladdin/api/v1/issue-token`, {
        client_id: clientId,
        client_secret: clientSecret,
        username,
        password,
        grant_type: 'password',
      });

      if (response.data && response.data.access_token) {
        this.cachedAccessToken = response.data.access_token;
        this.tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;
        return this.cachedAccessToken;
      }
      return null;
    } catch (err) {
      this.logger.error(`Failed to acquire Pathao access token: ${(err as Error).message}`);
      return null;
    }
  }

  async bookParcel(request: CourierBookingRequest): Promise<CourierBookingResponse> {
    const { storeId, baseUrl } = this.getCredentials();
    const token = await this.getAccessToken();

    if (!token) {
      this.logger.error('Pathao credentials or token acquisition failed.');
      return {
        success: false,
        provider: this.name,
        status: 'error',
        error: 'Pathao credentials or token acquisition failed',
      };
    }

    try {
      const response = await axios.post(
        `${baseUrl}/aladdin/api/v1/orders`,
        {
          store_id: Number(storeId) || 1,
          merchant_order_id: request.invoice,
          recipient_name: request.recipientName,
          recipient_phone: request.recipientPhone,
          recipient_address: request.recipientAddress,
          amount_to_collect: request.codAmount,
          item_type: 2, // 1: Document, 2: Parcel
          item_quantity: 1,
          item_weight: 0.5,
          delivery_type: 48, // 48h standard delivery
          special_instruction: request.note || 'Gramer Bazar delivery',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      const data = response.data;
      if (data && data.data && data.data.consignment_id) {
        this.logger.log(`Pathao parcel booked. Consignment: ${data.data.consignment_id}`);
        return {
          success: true,
          provider: this.name,
          consignmentId: String(data.data.consignment_id),
          trackingCode: String(data.data.consignment_id),
          status: data.data.order_status || 'Pending',
        };
      }

      return {
        success: false,
        provider: this.name,
        status: 'rejected',
        error: JSON.stringify(data),
      };
    } catch (err) {
      const errorMsg = (err as Error).message;
      this.logger.error(`Error booking Pathao parcel: ${errorMsg}`);
      return {
        success: false,
        provider: this.name,
        status: 'error',
        error: errorMsg,
      };
    }
  }

  async trackParcel(trackingCode: string): Promise<CourierTrackingResponse> {
    const { baseUrl } = this.getCredentials();
    const token = await this.getAccessToken();

    if (!token) {
      return {
        success: false,
        provider: this.name,
        trackingCode,
        status: 'unknown',
        error: 'Pathao credentials missing',
      };
    }

    try {
      const response = await axios.get(`${baseUrl}/aladdin/api/v1/orders/${trackingCode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      const data = response.data;
      if (data && data.data) {
        return {
          success: true,
          provider: this.name,
          trackingCode,
          status: data.data.order_status || 'unknown',
          rawDetails: data.data,
        };
      }

      return {
        success: false,
        provider: this.name,
        trackingCode,
        status: 'unknown',
        error: 'Tracking details not found',
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
