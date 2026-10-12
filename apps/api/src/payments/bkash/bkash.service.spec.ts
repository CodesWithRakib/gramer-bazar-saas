import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { BkashService } from './bkash.service.js';

describe('BkashService', () => {
  let bkashService: BkashService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: vi.fn((key: string) => {
        if (key === 'BKASH_IS_SANDBOX') return true;
        if (key === 'BACKEND_URL') return 'http://localhost:4000';
        return undefined;
      }),
    } as unknown as ConfigService;

    bkashService = new BkashService(configService);
  });

  it('should be defined', () => {
    expect(bkashService).toBeDefined();
  });

  it('should grant token in mock/fallback mode', async () => {
    const token = await bkashService.grantToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should create payment session with paymentID and bkashURL', async () => {
    const response = await bkashService.createPayment({
      orderId: 'test-order-1234',
      amount: 1500,
      customerPhone: '01700000000',
    });

    expect(response.statusCode).toBe('0000');
    expect(response.paymentID).toBeDefined();
    expect(response.bkashURL).toContain('paymentID=');
    expect(response.amount).toBe('1500.00');
  });

  it('should execute payment and return transaction ID', async () => {
    const response = await bkashService.executePayment('BKASH_MOCK_PAY_123');

    expect(response.statusCode).toBe('0000');
    expect(response.trxID).toBeDefined();
    expect(response.transactionStatus).toBe('Completed');
  });

  it('should process instant refund successfully', async () => {
    const response = await bkashService.refundPayment({
      paymentId: 'BKASH_MOCK_PAY_123',
      trxId: 'TRX_123_MOCK',
      amount: 1500,
      reason: 'Product return',
    });

    expect(response.statusCode).toBe('0000');
    expect(response.refundTrxID).toBeDefined();
    expect(response.transactionStatus).toBe('Completed');
  });
});
