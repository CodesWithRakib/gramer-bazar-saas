import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: any;

  beforeEach(async () => {
    service = {
      validateAndFinalizePayment: vi.fn(),
      handleFail: vi.fn(),
      handleCancel: vi.fn(),
      retryPayment: vi.fn(),
      getPaymentByTransactionId: vi.fn(),
      getPaymentsByOrderId: vi.fn(),
      getMyPayments: vi.fn(),
      findAllAdmin: vi.fn(),
      findOneAdmin: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentsService, useValue: service },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key) => {
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              return null;
            }),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('handleSuccess redirects to frontend success page when payment is valid', async () => {
    service.validateAndFinalizePayment.mockResolvedValue({
      success: true,
      order: { id: 'order-123' },
    });

    const res: any = { redirect: vi.fn() };
    await controller.handleSuccess(
      { tran_id: 'GBZ_SUCCESS', value_a: 'order-123', value_c: 'en' },
      res,
    );

    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining('/en/payment/success?orderId=order-123&tran_id=GBZ_SUCCESS'),
    );
  });

  it('handleIpn returns 200 OK on successful verification', async () => {
    service.validateAndFinalizePayment.mockResolvedValue({ success: true });
    const res: any = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await controller.handleIpn({ tran_id: 'GBZ_IPN_123', status: 'VALID' }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('IPN handled successfully');
  });

  it('handleIpn returns 400 Bad Request on invalid verification', async () => {
    service.validateAndFinalizePayment.mockResolvedValue({
      success: false,
      message: 'Amount tampering detected',
    });
    const res: any = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await controller.handleIpn({ tran_id: 'GBZ_IPN_FAIL', status: 'INVALID' }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining('Amount tampering detected'));
  });
});
