import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { CourierService } from './courier.service.js';
import { MockCourierProvider } from './mock-courier.provider.js';
import { SteadfastCourierProvider } from './steadfast-courier.provider.js';
import { PathaoCourierProvider } from './pathao-courier.provider.js';
import { Delivery } from '../entities/delivery.entity.js';
import { Order } from '../../orders/entities/order.entity.js';
import { DeliveryStatus } from '../enums/delivery-status.enum.js';
import { OrderStatus, PaymentMethod } from '../../orders/enums/order-status.enum.js';

describe('CourierService', () => {
  let courierService: CourierService;
  let configService: ConfigService;
  let mockProvider: MockCourierProvider;
  let steadfastProvider: SteadfastCourierProvider;
  let pathaoProvider: PathaoCourierProvider;
  let deliveryRepo: Repository<Delivery>;
  let orderRepo: Repository<Order>;

  beforeEach(() => {
    configService = {
      get: vi.fn((key: string) => {
        if (key === 'COURIER_DEFAULT_PROVIDER') return 'MOCK';
        return undefined;
      }),
    } as unknown as ConfigService;

    mockProvider = new MockCourierProvider();
    steadfastProvider = new SteadfastCourierProvider(configService);
    pathaoProvider = new PathaoCourierProvider(configService);

    deliveryRepo = {
      findOne: vi.fn(),
      create: vi.fn((dto) => dto as Delivery),
      save: vi.fn((dto) => Promise.resolve(dto as Delivery)),
    } as unknown as Repository<Delivery>;

    orderRepo = {
      findOne: vi.fn(),
      save: vi.fn((dto) => Promise.resolve(dto as Order)),
    } as unknown as Repository<Order>;

    courierService = new CourierService(
      configService,
      mockProvider,
      steadfastProvider,
      pathaoProvider,
      deliveryRepo,
      orderRepo,
    );
  });

  it('should be defined', () => {
    expect(courierService).toBeDefined();
  });

  it('should return mock provider by default', () => {
    const provider = courierService.getProvider();
    expect(provider.name).toBe('MOCK');
  });

  it('should return steadfast provider when requested', () => {
    const provider = courierService.getProvider('STEADFAST');
    expect(provider.name).toBe('STEADFAST');
  });

  it('should return pathao provider when requested', () => {
    const provider = courierService.getProvider('PATHAO');
    expect(provider.name).toBe('PATHAO');
  });

  it('should book courier parcel and update delivery status', async () => {
    const mockOrder = {
      id: 'order-uuid-1',
      total: 1200,
      paymentMethod: PaymentMethod.COD,
      address: {
        contactName: 'Karim',
        contactPhone: '01711111111',
        streetAddress: 'Dhanmondi, Dhaka',
      },
      user: { phone: '01711111111' },
      status: OrderStatus.PENDING,
    } as unknown as Order;

    vi.spyOn(orderRepo, 'findOne').mockResolvedValue(mockOrder);
    vi.spyOn(deliveryRepo, 'findOne').mockResolvedValue(null);

    const result = await courierService.bookCourierForOrder('order-uuid-1', 'MOCK', 'Fragile item');

    expect(result.booking.success).toBe(true);
    expect(result.delivery.courierProvider).toBe('MOCK');
    expect(result.delivery.status).toBe(DeliveryStatus.OUT_FOR_DELIVERY);
    expect(result.delivery.trackingCode).toBeDefined();
  });

  it('should handle webhook status update and advance delivery to DELIVERED', async () => {
    const mockDelivery = {
      id: 'del-uuid',
      trackingCode: 'TRACK123',
      status: DeliveryStatus.OUT_FOR_DELIVERY,
      order: { id: 'order-1', status: OrderStatus.PROCESSING } as Order,
    } as unknown as Delivery;

    vi.spyOn(deliveryRepo, 'findOne').mockResolvedValue(mockDelivery);

    const webhookResult = await courierService.handleCourierWebhook('steadfast', {
      tracking_code: 'TRACK123',
      status: 'delivered',
    });

    expect(webhookResult.success).toBe(true);
    expect(mockDelivery.status).toBe(DeliveryStatus.DELIVERED);
    expect(mockDelivery.order.status).toBe(OrderStatus.DELIVERED);
  });
});
