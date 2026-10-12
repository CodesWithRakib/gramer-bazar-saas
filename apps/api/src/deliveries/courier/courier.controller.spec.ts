import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CourierController } from './courier.controller.js';
import { CourierService } from './courier.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CourierProviderType } from './dto/book-courier.dto.js';

describe('CourierController', () => {
  let controller: CourierController;
  let service: {
    bookCourierForOrder: ReturnType<typeof vi.fn>;
    trackParcel: ReturnType<typeof vi.fn>;
    handleCourierWebhook: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      bookCourierForOrder: vi.fn(),
      trackParcel: vi.fn(),
      handleCourierWebhook: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourierController],
      providers: [{ provide: CourierService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CourierController>(CourierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('bookParcel should delegate to CourierService', async () => {
    service.bookCourierForOrder.mockResolvedValueOnce({
      delivery: { id: 'del-1' },
      booking: { success: true },
    });

    const res = await controller.bookParcel({
      orderId: 'order-1',
      provider: CourierProviderType.MOCK,
      note: 'Rush delivery',
    });

    expect(res).toBeDefined();
    expect(service.bookCourierForOrder).toHaveBeenCalledWith(
      'order-1',
      CourierProviderType.MOCK,
      'Rush delivery',
    );
  });

  it('trackParcel should delegate to CourierService', async () => {
    service.trackParcel.mockResolvedValueOnce({
      trackingCode: 'TRK123',
      status: 'in_transit',
    });

    const res = await controller.trackParcel('TRK123');
    expect(res).toBeDefined();
    expect(service.trackParcel).toHaveBeenCalledWith('TRK123');
  });

  it('handleWebhook should delegate to CourierService', async () => {
    service.handleCourierWebhook.mockResolvedValueOnce({
      success: true,
      status: 'delivered',
    });

    const res = await controller.handleWebhook('steadfast', {
      tracking_code: 'TRK123',
      status: 'delivered',
    });

    expect(res).toBeDefined();
    expect(service.handleCourierWebhook).toHaveBeenCalledWith('steadfast', {
      tracking_code: 'TRK123',
      status: 'delivered',
    });
  });
});
