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
import { AssignDeliveryDto } from './dto/assign-delivery.dto.js';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto.js';
import { Role } from '../roles/enums/role.enum.js';

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
  ) {}

  // --- ADMIN ACTIONS ---

  async getAllDeliveries(page?: number, limit?: number, search?: string) {
    if (!page || !limit) {
      return this.deliveryRepository.find({
        relations: ['order', 'rider', 'order.address'],
        order: { createdAt: 'DESC' },
      });
    }

    const query = this.deliveryRepository.createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.order', 'order')
      .leftJoinAndSelect('delivery.rider', 'rider')
      .leftJoinAndSelect('order.address', 'address')
      .orderBy('delivery.createdAt', 'DESC');

    if (search) {
      query.andWhere('delivery.id::text ILIKE :search', { search: `%${search}%` });
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
    return this.userRepository.createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.name = :role', { role: Role.RIDER })
      .select(['user.id', 'user.firstName', 'user.lastName', 'user.phone'])
      .getMany();
  }

  async assignDelivery(adminId: string, dto: AssignDeliveryDto) {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, { where: { id: dto.orderId } });
      if (!order) throw new NotFoundException('Order not found');

      const rider = await manager.findOne(User, {
        where: { id: dto.riderId },
        relations: ['roles'],
      });
      if (!rider || !rider.roles.some((r) => r.name === Role.RIDER)) {
        throw new BadRequestException('Invalid rider ID');
      }

      let delivery = await manager.findOne(Delivery, { where: { orderId: order.id } });
      
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

  async getDeliveryByIdForRider(riderId: string, id: string) {
    const delivery = await this.deliveryRepository.findOne({
      where: { id, riderId },
      relations: ['order', 'order.address', 'order.user', 'order.items', 'order.items.sellerProduct', 'order.items.sellerProduct.productVariant', 'order.items.sellerProduct.productVariant.product'],
    });

    if (!delivery) throw new NotFoundException('Delivery not found or not assigned to you');
    return delivery;
  }

  async updateDeliveryStatus(userId: string, id: string, dto: UpdateDeliveryStatusDto, isAdmin: boolean = false) {
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
        order.status = newOrderStatus;
        
        // Synchronize COD payment status
        if (newOrderStatus === OrderStatus.DELIVERED && order.paymentMethod === PaymentMethod.COD) {
          order.paymentStatus = PaymentStatus.PAID;
        }

        await manager.save(Order, order);
        
        await manager.insert(OrderStatusHistory, {
          orderId: order.id,
          status: newOrderStatus,
          remark: `Updated via Delivery tracking: ${dto.status}`,
        });

        // Use event emitter to avoid blocking the transaction
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

  // --- CUSTOMER ACTIONS ---

  async getCustomerDelivery(userId: string, orderId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId, userId } });
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
      rider: delivery.rider ? {
        firstName: delivery.rider.firstName,
        lastName: delivery.rider.lastName,
        phone: delivery.rider.phone,
      } : null,
    };
  }
}
