import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentsService } from './payments.service.js';
import { Order } from '../orders/entities/order.entity.js';
import { Payment } from './entities/payment.entity.js';
import { PaymentStatus } from './enums/payment-status.enum.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentRepo: any;
  let orderRepo: any;
  let dataSource: any;

  beforeEach(async () => {
    paymentRepo = {
      create: vi.fn((data) => ({ id: 'payment-uuid-1', ...data })),
      save: vi.fn(async (data) => data),
      findOne: vi.fn(),
      find: vi.fn(),
      findAndCount: vi.fn().mockResolvedValue([[], 0]),
      createQueryBuilder: vi.fn(),
    };

    orderRepo = {
      findOne: vi.fn(),
      save: vi.fn(async (data) => data),
    };

    dataSource = {
      transaction: vi.fn(async (cb) => {
        const manager = {
          findOne: vi.fn(),
          save: vi.fn(async (_entityClass, data) => data),
          create: vi.fn((_cls, data) => data),
        };
        return cb(manager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key) => {
              if (key === 'SSLCOMMERZ_STORE_ID') return 'test_store_id';
              if (key === 'SSLCOMMERZ_STORE_PASSWORD') return 'test_store_pass';
              if (key === 'SSLCOMMERZ_IS_LIVE') return 'false';
              if (key === 'SSLCOMMERZ_PUBLIC_URL') return 'https://test-tunnel.ngrok-free.app';
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              return null;
            }),
          },
        },
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: AuditLogsService, useValue: { record: vi.fn() } },
        { provide: NotificationsService, useValue: { sendOrderConfirmationEmail: vi.fn() } },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTransactionId', () => {
    it('should generate valid unique transaction ID <= 30 chars starting with GBZ_', () => {
      const orderId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const tranId1 = service.generateTransactionId(orderId);
      const tranId2 = service.generateTransactionId(orderId);

      expect(tranId1).toMatch(/^GBZ_[A-Z0-9]{8}_/);
      expect(tranId1.length).toBeLessThanOrEqual(30);
      expect(tranId1).not.toBe(tranId2);
    });
  });

  describe('validateAndFinalizePayment', () => {
    it('should return alreadyProcessed=true when payment is already PAID (Idempotent)', async () => {
      const existingPayment: any = {
        id: 'payment-1',
        transactionId: 'GBZ_TEST123',
        amount: 1500,
        currency: 'BDT',
        status: PaymentStatus.PAID,
        order: { id: 'order-1', status: OrderStatus.CONFIRMED },
      };

      dataSource.transaction = vi.fn(async (cb) => {
        const manager = {
          findOne: vi.fn().mockResolvedValue(existingPayment),
          save: vi.fn(),
        };
        return cb(manager);
      });

      const res = await service.validateAndFinalizePayment({
        tran_id: 'GBZ_TEST123',
        val_id: 'VAL_9999',
        status: 'VALID',
        amount: '1500.00',
        currency: 'BDT',
      });

      expect(res.success).toBe(true);
      expect(res.alreadyProcessed).toBe(true);
      expect(res.payment?.status).toBe(PaymentStatus.PAID);
    });

    it('should detect and reject amount tampering', async () => {
      const pendingPayment: any = {
        id: 'payment-1',
        transactionId: 'GBZ_TAMPER',
        amount: 1500,
        currency: 'BDT',
        status: PaymentStatus.INITIATED,
        order: { id: 'order-1', status: OrderStatus.PENDING },
      };

      dataSource.transaction = vi.fn(async (cb) => {
        const manager = {
          findOne: vi.fn().mockResolvedValue(pendingPayment),
          save: vi.fn(async (_cls, data) => data),
        };
        return cb(manager);
      });

      vi.spyOn(service, 'validateServerSide').mockResolvedValue({
        status: 'VALID',
        amount: '10.00', // Tampered amount
        currency: 'BDT',
        tran_id: 'GBZ_TAMPER',
      });

      const res = await service.validateAndFinalizePayment({
        tran_id: 'GBZ_TAMPER',
        val_id: 'VAL_TAMPER',
        status: 'VALID',
        amount: '10.00',
        currency: 'BDT',
      });

      expect(res.success).toBe(false);
      expect(res.message).toBe('Amount tampering detected');
      expect(pendingPayment.status).toBe(PaymentStatus.FAILED);
      expect(pendingPayment.riskLevel).toBe('DANGER');
    });

    it('should successfully finalize payment when valid', async () => {
      const order = { id: 'order-1', status: OrderStatus.PENDING, paymentStatus: 'PENDING' };
      const pendingPayment: any = {
        id: 'payment-1',
        orderId: 'order-1',
        transactionId: 'GBZ_VALID',
        amount: 500,
        currency: 'BDT',
        status: PaymentStatus.INITIATED,
        order,
      };

      dataSource.transaction = vi.fn(async (cb) => {
        const manager = {
          findOne: vi.fn(async (cls) => (cls === Payment ? pendingPayment : order)),
          save: vi.fn(async (_cls, data) => data),
        };
        return cb(manager);
      });

      vi.spyOn(service, 'validateServerSide').mockResolvedValue({
        status: 'VALID',
        amount: '500.00',
        currency: 'BDT',
        tran_id: 'GBZ_VALID',
        bank_tran_id: 'BANK_123456',
        card_type: 'BKASH-BKash',
      });

      const res = await service.validateAndFinalizePayment({
        tran_id: 'GBZ_VALID',
        val_id: 'VAL_VALID_123',
        status: 'VALID',
        amount: '500.00',
        currency: 'BDT',
      });

      expect(res.success).toBe(true);
      expect(pendingPayment.status).toBe(PaymentStatus.PAID);
      expect(pendingPayment.bankTransactionId).toBe('BANK_123456');
      expect(pendingPayment.order.status).toBe(OrderStatus.CONFIRMED);
      expect(pendingPayment.order.paymentStatus).toBe(PaymentStatus.PAID);
    });
  });
});
