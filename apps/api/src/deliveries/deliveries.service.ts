import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Delivery } from './entities/delivery.entity.js';
import { DeliveryHistory } from './entities/delivery-history.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderStatusHistory } from '../orders/entities/order-status-history.entity.js';
import { User } from '../users/entities/user.entity.js';
import { DeliveryStatus } from './enums/delivery-status.enum.js';
import { OrderStatus, PaymentStatus, PaymentMethod } from '../orders/enums/order-status.enum.js';
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from '../notifications/entities/notification.entity.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { AssignDeliveryDto } from './dto/assign-delivery.dto.js';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto.js';
import { RiderHistoryQueryDto } from './dto/rider-history-query.dto.js';
import { Role } from '../roles/enums/role.enum.js';
import { RidersService } from '../riders/riders.service.js';
import { RiderAvailability } from '../riders/enums/rider-availability.enum.js';

import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationsService: NotificationsService,
    private readonly ridersService: RidersService,
  ) {}

  // --- ADMIN ACTIONS ---

  async getAllDeliveries(page?: number, limit?: number, search?: string) {
    if (!page || !limit) {
      return this.deliveryRepository.find({
        relations: ['order', 'rider', 'order.address'],
        order: { createdAt: 'DESC' },
      });
    }

    const query = this.deliveryRepository
      .createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.order', 'order')
      .leftJoinAndSelect('delivery.rider', 'rider')
      .leftJoinAndSelect('order.address', 'address')
      .orderBy('delivery.createdAt', 'DESC');

    if (search) {
      query.andWhere('delivery.id::text ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRiders() {
    const riders = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.name = :role', { role: Role.RIDER })
      .select(['user.id', 'user.firstName', 'user.lastName', 'user.phone'])
      .getMany();

    const availabilityMap = await this.ridersService.getAvailabilityMap(riders.map((r) => r.id));
    return riders.map((rider) => ({
      ...rider,
      availability: availabilityMap[rider.id] ?? RiderAvailability.OFFLINE,
    }));
  }

  async assignDelivery(adminId: string, dto: AssignDeliveryDto) {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: dto.orderId },
      });
      if (!order) throw new NotFoundException('Order not found');

      const rider = await manager.findOne(User, {
        where: { id: dto.riderId },
        relations: ['roles'],
      });
      if (!rider || !rider.roles.some((r) => r.name === Role.RIDER)) {
        throw new BadRequestException('Invalid rider ID');
      }

      let delivery = await manager.findOne(Delivery, {
        where: { orderId: order.id },
      });

      const previousRiderId = delivery?.riderId ?? null;

      if (delivery) {
        // Re-assign logic
        delivery.riderId = dto.riderId;
        delivery.status = DeliveryStatus.ASSIGNED;
        delivery.assignedAt = new Date();
      } else {
        // Create new delivery
        delivery = manager.create(Delivery, {
          orderId: order.id,
          riderId: dto.riderId,
          status: DeliveryStatus.ASSIGNED,
          assignedAt: new Date(),
        });
      }

      delivery = await manager.save(Delivery, delivery);

      // Save delivery history
      await manager.insert(DeliveryHistory, {
        deliveryId: delivery.id,
        status: DeliveryStatus.ASSIGNED,
        changedById: adminId,
        notes: `Assigned to rider ${rider.firstName} ${rider.lastName}`,
      });

      // Notifications for the rider and customer
      const orderShortId = order.id.slice(0, 8).toUpperCase();
      const riderFullName =
        `${rider.firstName || ''} ${rider.lastName || ''}`.trim() || 'Delivery Rider';

      void this.notificationsService.notifyUser(rider.id, {
        type: NotificationType.DELIVERY_ASSIGNED,
        title: 'New Delivery Assigned',
        message: `Order #${orderShortId} has been assigned to you for delivery.`,
        titleKey: 'notifications.delivery_assigned_rider.title',
        messageKey: 'notifications.delivery_assigned_rider.message',
        priority: NotificationPriority.HIGH,
        data: {
          orderId: order.id,
          deliveryId: delivery.id,
          orderNumber: orderShortId,
        },
      });

      // Inform a rider who lost the assignment to a re-dispatch.
      if (previousRiderId && previousRiderId !== dto.riderId) {
        void this.notificationsService.notifyUser(previousRiderId, {
          type: NotificationType.DELIVERY_REASSIGNED,
          title: 'Delivery Reassigned',
          message: `Order #${orderShortId} has been reassigned to another rider.`,
          titleKey: 'notifications.delivery_reassigned_rider.title',
          messageKey: 'notifications.delivery_reassigned_rider.message',
          priority: NotificationPriority.NORMAL,
          data: { orderId: order.id, deliveryId: delivery.id, orderNumber: orderShortId },
        });
      }

      void this.notificationsService.notifyUser(order.userId, {
        type: NotificationType.DELIVERY_ASSIGNED,
        title: 'Rider Assigned',
        message: `${riderFullName} has been assigned to deliver order #${orderShortId}.`,
        titleKey: 'notifications.delivery_assigned_customer.title',
        messageKey: 'notifications.delivery_assigned_customer.message',
        priority: NotificationPriority.NORMAL,
        data: {
          orderId: order.id,
          deliveryId: delivery.id,
          orderNumber: orderShortId,
          riderName: riderFullName,
        },
      });

      return delivery;
    });
  }

  // --- RIDER ACTIONS ---

  async getRiderDeliveries(riderId: string) {
    return this.deliveryRepository.find({
      where: { riderId },
      relations: ['order', 'order.address', 'order.user'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getRiderHistory(riderId: string, query: RiderHistoryQueryDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const qb = this.deliveryRepository
      .createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.order', 'order')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.user', 'user')
      .where('delivery.riderId = :riderId', { riderId })
      .orderBy('COALESCE(delivery.deliveryTime, delivery.updatedAt)', 'DESC');

    if (query.status) {
      qb.andWhere('delivery.status = :status', { status: query.status });
    }
    if (query.search) {
      qb.andWhere('(delivery.id::text ILIKE :search OR order.id::text ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }
    if (query.from) {
      qb.andWhere('COALESCE(delivery.deliveryTime, delivery.createdAt) >= :from', {
        from: new Date(query.from),
      });
    }
    if (query.to) {
      qb.andWhere('COALESCE(delivery.deliveryTime, delivery.createdAt) <= :to', {
        to: new Date(query.to),
      });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getRiderDashboard(riderId: string) {
    const deliveries = await this.deliveryRepository.find({
      where: { riderId },
      relations: ['order', 'order.address', 'order.user'],
      order: { updatedAt: 'DESC' },
    });

    const assignedCount = deliveries.filter((d) => d.status === DeliveryStatus.ASSIGNED).length;
    const activeCount = deliveries.filter((d) =>
      [DeliveryStatus.ACCEPTED, DeliveryStatus.PICKED_UP, DeliveryStatus.OUT_FOR_DELIVERY].includes(
        d.status,
      ),
    ).length;
    const completedCount = deliveries.filter((d) => d.status === DeliveryStatus.DELIVERED).length;

    const totalEarnings = deliveries
      .filter((d) => d.status === DeliveryStatus.DELIVERED)
      .reduce((sum, d) => sum + (Number(d.order?.deliveryFee) || 0), 0);

    const deliveriesTrendRaw = await this.deliveryRepository.manager.query(
      `
      SELECT TO_CHAR(d.created_at, 'Dy') as name,
             COUNT(CASE WHEN d.status = 'DELIVERED' THEN 1 END)::int as completed,
             COUNT(CASE WHEN d.status != 'DELIVERED' THEN 1 END)::int as pending,
             SUM(CASE WHEN d.status = 'DELIVERED' THEN COALESCE(o.delivery_fee, 0) ELSE 0 END)::float as earnings
      FROM deliveries d
      LEFT JOIN orders o ON o.id = d.order_id
      WHERE d.rider_id = $1 AND d.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY TO_CHAR(d.created_at, 'Dy')
      ORDER BY MIN(d.created_at) ASC
    `,
      [riderId],
    );

    const deliveriesTrend = deliveriesTrendRaw.map((r: any) => ({
      name: r.name,
      completed: Number(r.completed || 0),
      pending: Number(r.pending || 0),
      earnings: Number(r.earnings || 0),
    }));

    return {
      metrics: {
        assignedCount,
        activeCount,
        completedCount,
        totalEarnings,
      },
      deliveriesTrend,
      recentDeliveries: deliveries.slice(0, 5),
    };
  }

  async getDeliveryByIdForRider(riderId: string, id: string) {
    const delivery = await this.deliveryRepository.findOne({
      where: { id, riderId },
      relations: [
        'order',
        'order.address',
        'order.address.division',
        'order.address.district',
        'order.address.upazila',
        'order.user',
        'order.items',
        'order.items.sellerProduct',
        'order.items.sellerProduct.shop',
        'order.items.sellerProduct.productVariant',
        'order.items.sellerProduct.productVariant.product',
      ],
    });

    if (!delivery) throw new NotFoundException('Delivery not found or not assigned to you');
    return delivery;
  }

  async updateDeliveryStatus(
    userId: string,
    id: string,
    dto: UpdateDeliveryStatusDto,
    isAdmin: boolean = false,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const delivery = await manager.findOne(Delivery, {
        where: { id },
        relations: ['order'],
      });

      if (!delivery) throw new NotFoundException('Delivery not found');
      if (!isAdmin && delivery.riderId !== userId) {
        throw new BadRequestException('Unauthorized to update this delivery');
      }

      // State machine validation
      this.validateStatusTransition(delivery.status, dto.status);

      delivery.status = dto.status;

      if (dto.status === DeliveryStatus.PICKED_UP) {
        delivery.pickupTime = new Date();
      } else if (dto.status === DeliveryStatus.DELIVERED) {
        delivery.deliveryTime = new Date();
      }

      await manager.save(Delivery, delivery);

      await manager.insert(DeliveryHistory, {
        deliveryId: delivery.id,
        status: dto.status,
        changedById: userId,
        notes: dto.notes,
      });

      // Rider availability is driven by the delivery lifecycle.
      if (delivery.riderId) {
        if (dto.status === DeliveryStatus.ACCEPTED) {
          await this.ridersService.applySystemAvailability(
            manager,
            delivery.riderId,
            RiderAvailability.BUSY,
          );
        } else if (
          dto.status === DeliveryStatus.DELIVERED ||
          dto.status === DeliveryStatus.FAILED ||
          dto.status === DeliveryStatus.CANCELLED
        ) {
          await this.ridersService.applySystemAvailability(
            manager,
            delivery.riderId,
            RiderAvailability.AVAILABLE,
          );
        }
      }

      // Credit the rider's earning ledger exactly once per completed delivery.
      if (dto.status === DeliveryStatus.DELIVERED && delivery.riderId) {
        await this.ridersService.recordDeliveryEarning(manager, {
          riderId: delivery.riderId,
          deliveryId: delivery.id,
          orderId: delivery.orderId,
          amount: Number(delivery.order?.deliveryFee) || 0,
        });
      }

      // Synchronize Order status
      const order = delivery.order;
      let newOrderStatus: OrderStatus | null = null;

      switch (dto.status) {
        case DeliveryStatus.PICKED_UP:
          newOrderStatus = OrderStatus.PICKED_UP;
          break;
        case DeliveryStatus.OUT_FOR_DELIVERY:
          newOrderStatus = OrderStatus.OUT_FOR_DELIVERY;
          break;
        case DeliveryStatus.DELIVERED:
          newOrderStatus = OrderStatus.DELIVERED;
          break;
        case DeliveryStatus.FAILED:
          newOrderStatus = OrderStatus.FAILED;
          break;
        case DeliveryStatus.CANCELLED:
          newOrderStatus = OrderStatus.CANCELLED;
          break;
      }

      if (newOrderStatus && order.status !== newOrderStatus) {
        const previousOrderStatus = order.status;
        order.status = newOrderStatus;

        // Synchronize COD payment status
        if (newOrderStatus === OrderStatus.DELIVERED && order.paymentMethod === PaymentMethod.COD) {
          order.paymentStatus = PaymentStatus.PAID;
        }

        await manager.save(Order, order);

        const history = new OrderStatusHistory();
        history.orderId = order.id;
        history.fromStatus = previousOrderStatus;
        history.status = newOrderStatus;
        history.toStatus = newOrderStatus;
        history.changedByUserId = userId;
        history.changedByRole = isAdmin ? 'ADMIN' : 'RIDER';
        history.reason = `Updated via Delivery tracking: ${dto.status}`;
        history.remark = `Updated via Delivery tracking: ${dto.status}`;
        await manager.save(OrderStatusHistory, history);

        // Canonical realtime event
        this.eventEmitter.emit('order.status.updated', {
          orderId: order.id,
          previousStatus: previousOrderStatus,
          currentStatus: newOrderStatus,
          updatedAt: new Date(),
          userId: order.userId,
          riderUserId: delivery.riderId,
        });

        // In-app notifications for customer based on delivery tracking
        const orderShortId = order.id.slice(0, 8).toUpperCase();
        if (dto.status === DeliveryStatus.DELIVERED && delivery.riderId) {
          const payout = Number(delivery.order?.deliveryFee) || 0;
          void this.notificationsService.notifyUser(delivery.riderId, {
            type: NotificationType.DELIVERY_COMPLETED,
            title: 'Delivery Completed',
            message: `Order #${orderShortId} was delivered successfully. ৳${payout.toFixed(2)} added to your earnings.`,
            titleKey: 'notifications.delivery_completed_rider.title',
            messageKey: 'notifications.delivery_completed_rider.message',
            priority: NotificationPriority.NORMAL,
            data: {
              orderId: order.id,
              deliveryId: delivery.id,
              orderNumber: orderShortId,
              amount: payout,
            },
          });
        }
        if (dto.status === DeliveryStatus.PICKED_UP) {
          void this.notificationsService.notifyUser(order.userId, {
            type: NotificationType.DELIVERY_STARTED,
            title: 'Order Picked Up',
            message: `Your order #${orderShortId} has been picked up and is out for delivery.`,
            titleKey: 'notifications.delivery_started.title',
            messageKey: 'notifications.delivery_started.message',
            priority: NotificationPriority.NORMAL,
            data: {
              orderId: order.id,
              deliveryId: delivery.id,
              orderNumber: orderShortId,
            },
          });
        } else if (dto.status === DeliveryStatus.FAILED) {
          void this.notificationsService.notifyUser(order.userId, {
            type: NotificationType.DELIVERY_FAILED,
            title: 'Delivery Failed',
            message: `Delivery attempt for order #${orderShortId} failed. Our team will contact you.`,
            titleKey: 'notifications.delivery_failed.title',
            messageKey: 'notifications.delivery_failed.message',
            priority: NotificationPriority.HIGH,
            data: {
              orderId: order.id,
              deliveryId: delivery.id,
              orderNumber: orderShortId,
            },
          });
        }

        // Backwards compatibility event
        this.eventEmitter.emit('order.status.changed', {
          orderId: order.id,
          customerId: order.userId,
          status: newOrderStatus,
        });
      }

      return manager.findOne(Delivery, {
        where: { id: delivery.id },
        relations: ['order', 'order.address', 'order.user'],
      });
    });
  }

  private validateStatusTransition(current: DeliveryStatus, next: DeliveryStatus) {
    const transitions: Record<DeliveryStatus, DeliveryStatus[]> = {
      [DeliveryStatus.UNASSIGNED]: [DeliveryStatus.ASSIGNED],
      [DeliveryStatus.ASSIGNED]: [DeliveryStatus.ACCEPTED, DeliveryStatus.CANCELLED],
      [DeliveryStatus.ACCEPTED]: [DeliveryStatus.PICKED_UP, DeliveryStatus.CANCELLED],
      [DeliveryStatus.PICKED_UP]: [DeliveryStatus.OUT_FOR_DELIVERY, DeliveryStatus.FAILED],
      [DeliveryStatus.OUT_FOR_DELIVERY]: [DeliveryStatus.DELIVERED, DeliveryStatus.FAILED],
      [DeliveryStatus.DELIVERED]: [],
      [DeliveryStatus.FAILED]: [],
      [DeliveryStatus.CANCELLED]: [],
    };

    const allowed = transitions[current] || [];
    if (!allowed.includes(next)) {
      throw new BadRequestException(`Cannot transition delivery from ${current} to ${next}`);
    }
  }

  async updateRiderLocation(riderId: string, id: string, lat: number, lng: number) {
    const delivery = await this.deliveryRepository.findOne({
      where: { id, riderId },
    });

    if (!delivery) throw new NotFoundException('Delivery not found or not assigned to you');
    if (delivery.status !== DeliveryStatus.OUT_FOR_DELIVERY) {
      throw new BadRequestException('Can only update location when OUT_FOR_DELIVERY');
    }

    delivery.currentLat = lat;
    delivery.currentLng = lng;
    delivery.lastLocationUpdatedAt = new Date();

    const saved = await this.deliveryRepository.save(delivery);
    // TypeORM returns decimal columns as strings from PostgreSQL — coerce back to numbers
    return {
      ...saved,
      currentLat:
        saved.currentLat !== null ? parseFloat(saved.currentLat as unknown as string) : null,
      currentLng:
        saved.currentLng !== null ? parseFloat(saved.currentLng as unknown as string) : null,
    };
  }

  // --- CUSTOMER ACTIONS ---

  async getCustomerDelivery(userId: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const delivery = await this.deliveryRepository.findOne({
      where: { orderId },
      relations: ['rider'],
    });

    if (!delivery) return null;

    // Return stripped down version for customer (hide full rider profile)
    return {
      status: delivery.status,
      assignedAt: delivery.assignedAt,
      pickupTime: delivery.pickupTime,
      deliveryTime: delivery.deliveryTime,
      currentLat: delivery.currentLat,
      currentLng: delivery.currentLng,
      lastLocationUpdatedAt: delivery.lastLocationUpdatedAt,
      rider: delivery.rider
        ? {
            firstName: delivery.rider.firstName,
            lastName: delivery.rider.lastName,
            phone: delivery.rider.phone,
          }
        : null,
    };
  }
}
