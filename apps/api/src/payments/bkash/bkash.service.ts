import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  BkashCreatePaymentRequest,
  BkashCreatePaymentResponse,
  BkashExecutePaymentResponse,
  BkashRefundRequest,
  BkashRefundResponse,
  BkashTokenResponse,
} from './bkash.interface.js';

@Injectable()
export class BkashService {
  private readonly logger = new Logger(BkashService.name);
  private cachedToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(private readonly configService: ConfigService) {}

  private getCredentials() {
    const appKey = this.configService.get<string>('BKASH_APP_KEY');
    const appSecret = this.configService.get<string>('BKASH_APP_SECRET');
    const username = this.configService.get<string>('BKASH_USERNAME');
    const password = this.configService.get<string>('BKASH_PASSWORD');
    const isSandbox = this.configService.get<boolean>('BKASH_IS_SANDBOX') ?? true;
    const baseUrl =
      this.configService.get<string>('BKASH_BASE_URL') ||
      (isSandbox
        ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout'
        : 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout');

    return { appKey, appSecret, username, password, baseUrl, isConfigured: Boolean(appKey && appSecret) };
  }

  /**
   * Acquires or returns cached bKash authentication ID token.
   */
  async grantToken(): Promise<string> {
    const { appKey, appSecret, username, password, baseUrl, isConfigured } = this.getCredentials();

    if (!isConfigured) {
      // Mock token for development and unit test environments
      return 'mock_bkash_id_token';
    }

    if (this.cachedToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    try {
      const response = await axios.post<BkashTokenResponse>(
        `${baseUrl}/token/grant`,
        { app_key: appKey, app_secret: appSecret },
        {
          headers: {
            username,
            password,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      const data = response.data;
      if (data && data.id_token) {
        this.cachedToken = data.id_token;
        // Expire token 60 seconds earlier than declared TTL
        this.tokenExpiresAt = Date.now() + ((data.expires_in || 3600) - 60) * 1000;
        return this.cachedToken;
      }

      throw new Error(`Token grant failed: ${data?.statusMessage || 'Unknown response'}`);
    } catch (err) {
      const errorMsg = (err as Error).message;
      this.logger.error(`Error granting bKash token: ${errorMsg}`);
      throw new BadRequestException(`bKash authentication failed: ${errorMsg}`);
    }
  }

  /**
   * Creates a tokenized checkout payment session.
   */
  async createPayment(request: BkashCreatePaymentRequest): Promise<BkashCreatePaymentResponse> {
    const { appKey, baseUrl, isConfigured } = this.getCredentials();
    const invoice = `GBZ_${request.orderId.slice(0, 8).toUpperCase()}_${Date.now().toString(36).toUpperCase()}`;

    if (!isConfigured) {
      // Mock bKash session for test / development
      const mockPaymentId = `BKASH_MOCK_PAY_${Date.now()}`;
      const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:4000';
      return {
        statusCode: '0000',
        statusMessage: 'Successful',
        paymentID: mockPaymentId,
        bkashURL: `${backendUrl}/api/v1/payments/bkash/mock-redirect?paymentID=${mockPaymentId}&orderId=${request.orderId}`,
        amount: request.amount.toFixed(2),
        intent: 'sale',
        merchantInvoiceNumber: invoice,
        paymentCreateTime: new Date().toISOString(),
        transactionStatus: 'Initiated',
      };
    }

    const token = await this.grantToken();
    const callbackURL =
      request.callbackUrl ||
      `${this.configService.get<string>('BACKEND_URL') || 'http://localhost:4000'}/api/v1/payments/bkash/callback`;

    try {
      const response = await axios.post<BkashCreatePaymentResponse>(
        `${baseUrl}/create`,
        {
          mode: '0011',
          payerReference: request.payerReference || request.customerPhone || '01700000000',
          callbackURL,
          amount: request.amount.toFixed(2),
          currency: 'BDT',
          intent: 'sale',
          merchantInvoiceNumber: invoice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-APP-Key': appKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      const data = response.data;
      if (data && data.statusCode === '0000' && data.paymentID) {
        this.logger.log(`Created bKash payment ${data.paymentID} for Order ${request.orderId}`);
        return data;
      }

      throw new Error(data?.statusMessage || 'Payment creation was rejected by bKash');
    } catch (err) {
      const errorMsg = (err as Error).message;
      this.logger.error(`Error creating bKash payment: ${errorMsg}`);
      throw new BadRequestException(`bKash payment initialization failed: ${errorMsg}`);
    }
  }

  /**
   * Executes a payment session after customer OTP and PIN validation.
   */
  async executePayment(paymentId: string): Promise<BkashExecutePaymentResponse> {
    const { appKey, baseUrl, isConfigured } = this.getCredentials();

    if (!isConfigured || paymentId.startsWith('BKASH_MOCK_PAY_')) {
      return {
        statusCode: '0000',
        statusMessage: 'Successful',
        paymentID: paymentId,
        trxID: `TRX_${Date.now()}_MOCK`,
        amount: '100.00',
        customerMsisdn: '01700000000',
        paymentExecuteTime: new Date().toISOString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: `INV_${Date.now()}`,
        transactionStatus: 'Completed',
      };
    }

    const token = await this.grantToken();

    try {
      const response = await axios.post<BkashExecutePaymentResponse>(
        `${baseUrl}/execute`,
        { paymentID: paymentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-APP-Key': appKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      const data = response.data;
      if (data && data.statusCode === '0000' && data.trxID) {
        this.logger.log(`bKash payment ${paymentId} executed successfully. TrxID: ${data.trxID}`);
        return data;
      }

      throw new Error(data?.statusMessage || 'Payment execution failed');
    } catch (err) {
      const errorMsg = (err as Error).message;
      this.logger.error(`Error executing bKash payment: ${errorMsg}`);
      throw new BadRequestException(`bKash payment execution failed: ${errorMsg}`);
    }
  }

  /**
   * Instant refund via bKash refund API.
   */
  async refundPayment(request: BkashRefundRequest): Promise<BkashRefundResponse> {
    const { appKey, baseUrl, isConfigured } = this.getCredentials();

    if (!isConfigured || request.paymentId.startsWith('BKASH_MOCK_PAY_')) {
      return {
        statusCode: '0000',
        statusMessage: 'Successful',
        originalTrxID: request.trxId,
        refundTrxID: `REFUND_${Date.now()}_MOCK`,
        transactionStatus: 'Completed',
        amount: request.amount.toFixed(2),
        currency: 'BDT',
        charge: '0.00',
        completedTime: new Date().toISOString(),
      };
    }

    const token = await this.grantToken();

    try {
      const response = await axios.post<BkashRefundResponse>(
        `${baseUrl}/payment/refund`,
        {
          paymentID: request.paymentId,
          trxID: request.trxId,
          amount: request.amount.toFixed(2),
          sku: request.sku || 'GramerBazarItem',
          reason: request.reason || 'Customer refund requested',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-APP-Key': appKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      const data = response.data;
      if (data && data.statusCode === '0000') {
        this.logger.log(`bKash refund executed successfully. RefundTrxID: ${data.refundTrxID}`);
        return data;
      }

      throw new Error(data?.statusMessage || 'Refund failed');
    } catch (err) {
      const errorMsg = (err as Error).message;
      this.logger.error(`Error executing bKash refund: ${errorMsg}`);
      throw new BadRequestException(`bKash refund failed: ${errorMsg}`);
    }
  }
}
