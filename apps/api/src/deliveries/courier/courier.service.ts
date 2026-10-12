import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CourierProvider,
  CourierBookingRequest,
  CourierBookingResponse,
  CourierTrackingResponse,
} from './courier.interface.js';
import { MockCourierProvider } from './mock-courier.provider.js';
import { SteadfastCourierProvider } from './steadfast-courier.provider.js';
import { PathaoCourierProvider } from './pathao-courier.provider.js';
import { Delivery } from '../entities/delivery.entity.js';
import { Order } from '../../orders/entities/order.entity.js';
import { DeliveryStatus } from '../enums/delivery-status.enum.js';
import { OrderStatus, PaymentMethod } from '../../orders/enums/order-status.enum.js';

@Injectable()
export class CourierService {
  private readonly logger = new Logger(CourierService.name);
  private readonly providers: Map<string, CourierProvider> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly mockProvider: MockCourierProvider,
    private readonly steadfastProvider: SteadfastCourierProvider,
    private readonly pathaoProvider: PathaoCourierProvider,
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {
    this.providers.set('MOCK', this.mockProvider);
    this.providers.set('STEADFAST', this.steadfastProvider);
    this.providers.set('PATHAO', this.pathaoProvider);
  }

  getProvider(name?: string): CourierProvider {
    const defaultProvider = this.configService.get<string>('COURIER_DEFAULT_PROVIDER') || 'MOCK';
    const providerKey = (name || defaultProvider).toUpperCase();
    const provider = this.providers.get(providerKey);

    if (!provider) {
      this.logger.warn(`Courier provider "${name}" not recognized. Falling back to MOCK.`);
      return this.mockProvider;
    }
    return provider;
  }

  /**
   * Books a 3PL parcel shipment for an existing order with Steadfast or Pathao.
   */
  async bookCourierForOrder(
    orderId: string,
    preferredProvider?: string,
    note?: string,
  ): Promise<{ delivery: Delivery; booking: CourierBookingResponse }> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['address', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    let delivery = await this.deliveryRepository.findOne({
      where: { orderId },
    });

    if (!delivery) {
      delivery = this.deliveryRepository.create({
        orderId,
        status: DeliveryStatus.UNASSIGNED,
      });
    }

    const provider = this.getProvider(preferredProvider);
    const recipientPhone = order.address?.contactPhone || order.user?.phone || '01700000000';
    const recipientName =
      order.address?.contactName ||
      `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() ||
      'Customer';
    const recipientAddress =
      order.address?.streetAddress ||
      `${order.address?.district || ''}, ${order.address?.division || ''}`.trim() ||
      'Bangladesh';

    // In COD, collect the order total; in ONLINE/prepaid, collect 0
    const codAmount = order.paymentMethod === PaymentMethod.COD ? Number(order.total) : 0;
    const invoice = `GBZ-${order.id.slice(0, 8).toUpperCase()}`;

    const bookingRequest: CourierBookingRequest = {
      orderId: order.id,
      invoice,
      recipientName,
      recipientPhone,
      recipientAddress,
      codAmount,
      note,
    };

    const booking = await provider.bookParcel(bookingRequest);

    if (!booking.success) {
      throw new BadRequestException(
        `Failed to book courier parcel with ${provider.name}: ${booking.error || 'Unknown error'}`,
      );
    }

    delivery.courierProvider = provider.name;
    delivery.consignmentId = booking.consignmentId || null;
    delivery.trackingCode = booking.trackingCode || null;
    delivery.courierStatus = booking.status;
    delivery.status = DeliveryStatus.OUT_FOR_DELIVERY;

    // Update order status to SHIPPED / PROCESSING
    order.status = OrderStatus.PROCESSING;
    await this.orderRepository.save(order);

    const savedDelivery = await this.deliveryRepository.save(delivery);
    return { delivery: savedDelivery, booking };
  }

  /**
   * Tracks a parcel status by tracking code.
   */
  async trackParcel(trackingCode: string, providerName?: string): Promise<CourierTrackingResponse> {
    const delivery = await this.deliveryRepository.findOne({
      where: { trackingCode },
    });

    const provider = this.getProvider(providerName || delivery?.courierProvider || undefined);
    return provider.trackParcel(trackingCode);
  }

  /**
   * Webhook handler for 3PL status updates.
   */
  async handleCourierWebhook(
    provider: string,
    payload: {
      tracking_code?: string;
      consignment_id?: string;
      status?: string;
      delivery_status?: string;
    },
  ) {
    const trackingCode = payload.tracking_code || payload.consignment_id;
    if (!trackingCode) {
      return { success: false, message: 'Missing tracking identifier' };
    }

    const delivery = await this.deliveryRepository.findOne({
      where: [{ trackingCode }, { consignmentId: trackingCode }],
      relations: ['order'],
    });

    if (!delivery) {
      return { success: false, message: 'Delivery record not found' };
    }

    const newStatus = payload.status || payload.delivery_status || 'updated';
    delivery.courierStatus = newStatus;

    if (['delivered', 'Delivered', 'completed'].includes(newStatus)) {
      delivery.status = DeliveryStatus.DELIVERED;
      delivery.deliveryTime = new Date();
      if (delivery.order) {
        delivery.order.status = OrderStatus.DELIVERED;
        await this.orderRepository.save(delivery.order);
      }
    } else if (['cancelled', 'returned', 'failed'].includes(newStatus)) {
      delivery.status = DeliveryStatus.FAILED;
    }

    await this.deliveryRepository.save(delivery);
    return { success: true, trackingCode, status: newStatus };
  }
}
