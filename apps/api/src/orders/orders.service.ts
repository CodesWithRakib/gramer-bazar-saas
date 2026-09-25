import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { CheckoutDto } from './dto/checkout.dto.js';
import { Order } from './entities/order.entity.js';
import { OrderItem } from './entities/order-item.entity.js';
import { OrderStatusHistory } from './entities/order-status-history.entity.js';
import { PaymentsService } from '../payments/payments.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { Notification, NotificationType } from '../notifications/entities/notification.entity.js';
import { User } from '../users/entities/user.entity.js';

import { OrderStatus, PaymentMethod, PaymentStatus } from './enums/order-status.enum.js';
import { Address } from '../addresses/entities/address.entity.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';
import { Coupon } from '../coupons/entities/coupon.entity.js';
import { CouponUsage } from '../coupons/entities/coupon-usage.entity.js';
import { DiscountType } from '../coupons/enums/discount-type.enum.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { validateRoleTransition } from './state-machine/order-state-machine.js';
import { TransitionOrderDto } from './dto/transition-order.dto.js';
import { Delivery } from '../deliveries/entities/delivery.entity.js';
import { DeliveryStatus } from '../deliveries/enums/delivery-status.enum.js';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private paymentsService: PaymentsService,
    private notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async checkout(userId: string, checkoutDto: CheckoutDto, originUrl: string) {
    const orderTxResult = await this.dataSource.transaction(async (manager) => {
      // 1. Validate Address
      const address = await manager.findOne(Address, {
        where: { id: checkoutDto.addressId, userId },
      });
      if (!address) {
        throw new NotFoundException(
          'Delivery address not found or does not belong to you.',
        );
      }

      // 2. Fetch SellerProducts
      const itemIds = checkoutDto.items.map((i) => i.sellerProductId);
      const dbProducts = await manager.find(SellerProduct, {
        where: { id: In(itemIds), isActive: true },
      });

      // Fetch and lock Inventory rows separately to avoid Postgres 'FOR UPDATE on nullable side of outer join' error
      const inventories = await manager.find(Inventory, {
        where: { sellerProductId: In(itemIds) },
        lock: { mode: 'pessimistic_write' },
      });

      // Attach inventory to products
      for (const product of dbProducts) {
        product.inventory = inventories.find((i) => i.sellerProductId === product.id) as any;
      }

      if (dbProducts.length !== itemIds.length) {
        throw new BadRequestException('One or more products are unavailable.');
      }

      let subtotal = 0;
      const orderItems: OrderItem[] = [];
      const inventoryUpdates: Inventory[] = [];

      // 3. Process each item, validate stock, and calculate subtotal
      for (const cartItem of checkoutDto.items) {
        const dbProduct = dbProducts.find(
          (p) => p.id === cartItem.sellerProductId,
        );
        if (!dbProduct) {
          throw new BadRequestException(
            `Product ${cartItem.sellerProductId} not found.`,
          );
        }

        const availableQty = dbProduct.inventory?.quantity || 0;
        if (availableQty < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${dbProduct.id}. Available: ${availableQty}`,
          );
        }

        const unitPrice = Number(dbProduct.discountPrice ?? dbProduct.price);
        const itemSubtotal = unitPrice * cartItem.quantity;
        subtotal += itemSubtotal;

        // Prepare OrderItem
        const orderItem = new OrderItem();
        orderItem.sellerProductId = dbProduct.id;
        orderItem.quantity = cartItem.quantity;
        orderItem.unitPrice = unitPrice;
        orderItem.subtotal = itemSubtotal;
        orderItems.push(orderItem);

        // Prepare Inventory update
        dbProduct.inventory.quantity -= cartItem.quantity;
        inventoryUpdates.push(dbProduct.inventory);
      }

      // 4. Calculate Delivery & Discount
      const deliveryFee = 50; // Flat 50 BDT for now
      let discount = 0;
      let appliedCoupon: Coupon | null = null;
      let couponUsage: CouponUsage | null = null;

      if (checkoutDto.couponCode) {
        appliedCoupon = await manager.findOne(Coupon, {
          where: { code: checkoutDto.couponCode.toUpperCase() },
          lock: { mode: 'pessimistic_write' },
        });

        if (!appliedCoupon) {
          throw new BadRequestException('Invalid coupon code');
        }
        if (!appliedCoupon.isActive) {
          throw new BadRequestException('This coupon is currently inactive');
        }

        const now = new Date();
        if (appliedCoupon.startDate && new Date(appliedCoupon.startDate) > now) {
          throw new BadRequestException('This coupon is not active yet');
        }
        if (appliedCoupon.endDate && new Date(appliedCoupon.endDate) < now) {
          throw new BadRequestException('This coupon has expired');
        }
        if (appliedCoupon.usageLimit !== null && appliedCoupon.usedCount >= appliedCoupon.usageLimit) {
          throw new BadRequestException('This coupon has reached its usage limit');
        }
        if (subtotal < (appliedCoupon.minOrderAmount || 0)) {
          throw new BadRequestException(`Minimum order amount of ${appliedCoupon.minOrderAmount} BDT is required to use this coupon`);
        }

        const userUsageCount = await manager.count(CouponUsage, {
          where: { couponId: appliedCoupon.id, userId },
        });

        if (userUsageCount >= appliedCoupon.customerUsageLimit) {
          throw new BadRequestException('You have reached the maximum usage limit for this coupon');
        }

        if (appliedCoupon.discountType === DiscountType.FIXED) {
          discount = Number(appliedCoupon.discountValue);
        } else if (appliedCoupon.discountType === DiscountType.PERCENTAGE) {
          discount = subtotal * (Number(appliedCoupon.discountValue) / 100);
          if (appliedCoupon.maxDiscountAmount && discount > Number(appliedCoupon.maxDiscountAmount)) {
            discount = Number(appliedCoupon.maxDiscountAmount);
          }
        }

        if (discount > subtotal) {
          discount = subtotal;
        }

        appliedCoupon.usedCount += 1;
        
        couponUsage = new CouponUsage();
        couponUsage.couponId = appliedCoupon.id;
        couponUsage.userId = userId;
        couponUsage.discountAmount = discount;
      }

      const total = subtotal + deliveryFee - discount;

      // 5. Create Order
      const order = new Order();
      order.userId = userId;
      order.addressId = address.id;
      order.subtotal = subtotal;
      order.deliveryFee = deliveryFee;
      order.discount = discount;
      order.total = total;
      order.status = OrderStatus.PENDING;
      order.paymentMethod = checkoutDto.paymentMethod;
      order.paymentStatus = PaymentStatus.PENDING;
      order.items = orderItems;

      // 6. Create Status History
      const statusHistory = new OrderStatusHistory();
      statusHistory.status = OrderStatus.PENDING;
      statusHistory.remark = 'Order placed successfully';
      
      order.statusHistory = [statusHistory];

      // 7. Save all within transaction
      await manager.save(Inventory, inventoryUpdates);
      const savedOrder = await manager.save(Order, order);

      if (couponUsage && appliedCoupon) {
        couponUsage.orderId = savedOrder.id;
        await manager.save(CouponUsage, couponUsage);
        await manager.save(Coupon, appliedCoupon);
      }

      const user = await manager.findOne(User, { where: { id: userId } });

      return { savedOrder, user, address };
    });

    const { savedOrder, user, address } = orderTxResult;

    // 8. Payment Gateway Session Initiation (runs after order is committed to satisfy foreign keys)
    let paymentUrl = null;
    if (savedOrder.paymentMethod !== PaymentMethod.COD) {
      paymentUrl = await this.paymentsService.initPayment(
        savedOrder,
        {
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Customer',
          email: user?.email || undefined,
          phone: user?.phone || undefined,
          address: address.streetAddress,
        },
        originUrl,
        checkoutDto.lang || 'en',
      );
    }

    if (user?.email) {
      try {
        await this.notificationsService.sendOrderConfirmationEmail(user.email, savedOrder);
      } catch (err: any) {
        this.logger.warn(`Failed to send order confirmation email: ${err.message}`);
      }
    }

    return { order: savedOrder, paymentUrl };
  }

  async findCustomerOrders(userId: string) {
    return this.dataSource.getRepository(Order).find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findCustomerOrderById(userId: string, orderId: string) {
    const order = await this.dataSource.getRepository(Order).findOne({
      where: { id: orderId, userId },
      relations: [
        'items', 
        'items.sellerProduct', 
        'items.sellerProduct.productVariant',
        'items.sellerProduct.productVariant.product',
        'statusHistory', 
        'address'
      ],
      order: {
        statusHistory: {
          createdAt: 'DESC',
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancelOrder(userId: string, orderId: string) {
    return this.transitionOrder(
      orderId,
      {
        targetStatus: OrderStatus.CANCELLED,
        reason: 'Cancelled by customer',
      },
      {
        id: userId,
        roles: ['CUSTOMER'],
      },
    );
  }

  async findAll(page?: number, limit?: number, search?: string) {
    const orderRepository = this.dataSource.getRepository(Order);
    if (!page || !limit) {
      return orderRepository.find({ relations: ['user', 'address'] });
    }

    const query = orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.address', 'address')
      .orderBy('order.createdAt', 'DESC');

    if (search) {
      query.andWhere('order.id::text ILIKE :search', { search: `%${search}%` });
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

  async updateAdminOrderStatus(orderId: string, status: string, adminId: string) {
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      throw new BadRequestException(`Invalid order status: ${status}`);
    }

    return this.transitionOrder(
      orderId,
      {
        targetStatus: status as OrderStatus,
        reason: `Status updated by Admin (${adminId})`,
      },
      {
        id: adminId,
        roles: ['ADMIN'],
      },
    );
  }

  async transitionOrder(
    orderId: string,
    dto: TransitionOrderDto,
    currentUser: { id: string; roles: string[]; ip?: string; userAgent?: string },
  ) {
    const { targetStatus, reason } = dto;

    const transitionResult = await this.dataSource.transaction(async (manager) => {
      // 1. Fetch Order with items, seller products, shops and lock
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: [
          'items',
          'items.sellerProduct',
          'items.sellerProduct.shop',
          'address',
          'user',
        ],
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === targetStatus) {
        return { order, previousStatus: order.status, delivery: null };
      }

      // 2. Fetch associated Delivery if any
      const delivery = await manager.findOne(Delivery, {
        where: { orderId: order.id },
      });

      // 3. Determine ownership context
      const isCustomerOwner = order.userId === currentUser.id;
      const isSellerOwner = (order.items || []).some(
        (item) => item.sellerProduct?.shop?.sellerId === currentUser.id,
      );
      const isAssignedRider = delivery?.riderId === currentUser.id;

      // 4. Validate role-based transition
      validateRoleTransition(order.status, targetStatus, currentUser.roles, {
        isCustomerOwner,
        isSellerOwner,
        isAssignedRider,
      });

      const previousStatus = order.status;
      order.status = targetStatus;

      // 5. Handle side effects based on target status
      // A. Cancellation: Restore inventory
      if (targetStatus === OrderStatus.CANCELLED) {
        const itemIds = (order.items || []).map((i) => i.sellerProductId);
        if (itemIds.length > 0) {
          const dbProducts = await manager.find(SellerProduct, {
            where: { id: In(itemIds) },
            relations: ['inventory'],
            lock: { mode: 'pessimistic_write' },
          });

          const inventoryUpdates: Inventory[] = [];
          for (const orderItem of order.items) {
            const dbProduct = dbProducts.find((p) => p.id === orderItem.sellerProductId);
            if (dbProduct && dbProduct.inventory) {
              dbProduct.inventory.quantity += orderItem.quantity;
              inventoryUpdates.push(dbProduct.inventory);
            }
          }

          if (inventoryUpdates.length > 0) {
            await manager.save(Inventory, inventoryUpdates);
          }
        }

        if (delivery && delivery.status !== DeliveryStatus.CANCELLED) {
          delivery.status = DeliveryStatus.CANCELLED;
          await manager.save(Delivery, delivery);
        }
      }

      // B. Delivered: Auto-mark COD as PAID, update delivery completion
      if (targetStatus === OrderStatus.DELIVERED) {
        if (order.paymentMethod === PaymentMethod.COD) {
          order.paymentStatus = PaymentStatus.PAID;
        }
        if (delivery && delivery.status !== DeliveryStatus.DELIVERED) {
          delivery.status = DeliveryStatus.DELIVERED;
          delivery.deliveryTime = new Date();
          await manager.save(Delivery, delivery);
        }
      }

      // C. Picked up: update delivery pickup time
      if (targetStatus === OrderStatus.PICKED_UP && delivery) {
        delivery.status = DeliveryStatus.PICKED_UP;
        delivery.pickupTime = new Date();
        await manager.save(Delivery, delivery);
      }

      // D. Out for delivery
      if (targetStatus === OrderStatus.OUT_FOR_DELIVERY && delivery) {
        delivery.status = DeliveryStatus.OUT_FOR_DELIVERY;
        await manager.save(Delivery, delivery);
      }

      // E. Failed delivery
      if (targetStatus === OrderStatus.FAILED && delivery) {
        delivery.status = DeliveryStatus.FAILED;
        await manager.save(Delivery, delivery);
      }

      // 6. Record OrderStatusHistory entry
      const statusHistory = new OrderStatusHistory();
      statusHistory.orderId = order.id;
      statusHistory.fromStatus = previousStatus;
      statusHistory.status = targetStatus;
      statusHistory.toStatus = targetStatus;
      statusHistory.changedByUserId = currentUser.id;
      statusHistory.changedByRole = currentUser.roles.join(',');
      statusHistory.reason = reason || `Status changed from ${previousStatus} to ${targetStatus}`;
      statusHistory.remark = reason || `Status changed from ${previousStatus} to ${targetStatus}`;
      statusHistory.metadata = {
        ip: currentUser.ip,
        userAgent: currentUser.userAgent,
      };
      await manager.save(OrderStatusHistory, statusHistory);

      // 7. Save Order
      const savedOrder = await manager.save(Order, order);

      // 8. Create In-App Notification for Customer
      const customerNotification = new Notification();
      customerNotification.userId = order.userId;
      customerNotification.title = 'Order Status Update';
      customerNotification.message = `Your order #${order.id.slice(0, 8).toUpperCase()} is now ${targetStatus.replace(/_/g, ' ').toLowerCase()}.`;
      customerNotification.type = NotificationType.ORDER_UPDATE;
      customerNotification.data = { orderId: order.id, status: targetStatus, reason };
      await manager.save(Notification, customerNotification);

      return { order: savedOrder, previousStatus, delivery };
    });

    const { order, previousStatus, delivery } = transitionResult;

    // 9. Collect relevant seller user IDs for realtime notification
    const sellerUserIds = Array.from(
      new Set(
        (order.items || [])
          .map((i) => i.sellerProduct?.shop?.sellerId)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    // 10. Emit non-blocking event for WebSockets and external listeners
    this.eventEmitter.emit('order.status.updated', {
      orderId: order.id,
      previousStatus,
      currentStatus: order.status,
      userId: order.userId,
      sellerUserIds,
      riderUserId: delivery?.riderId || null,
      updatedAt: new Date().toISOString(),
    });

    return order;
  }
}
