import {
  Injectable,
  BadRequestException,
  NotFoundException,
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

@Injectable()
export class OrdersService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private paymentsService: PaymentsService,
    private notificationsService: NotificationsService,
  ) {}

  async checkout(userId: string, checkoutDto: CheckoutDto, originUrl: string) {
    return this.dataSource.transaction(async (manager) => {
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
      
      let paymentUrl = null;
      if (savedOrder.paymentMethod !== PaymentMethod.COD) {
        paymentUrl = await this.paymentsService.initPayment(
          savedOrder, 
          { 
            name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Customer', 
            email: user?.email, 
            phone: user?.phone, 
            address: address.streetAddress 
          }, 
          originUrl
        );
      }

      if (user?.email) {
        await this.notificationsService.sendOrderConfirmationEmail(user.email, savedOrder);
      }

      return { order: savedOrder, paymentUrl };
    });
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
    return this.dataSource.transaction(async (manager) => {
      // 1. Fetch Order with items and pessimistic write lock
      const order = await manager.findOne(Order, {
        where: { id: orderId, userId },
        relations: ['items'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // 2. Check if cancellation is allowed
      if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
        throw new BadRequestException(`Order cannot be cancelled because it is already ${order.status}`);
      }

      // 3. Restore inventory
      const itemIds = order.items.map((i) => i.sellerProductId);
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

      // 4. Update order status
      order.status = OrderStatus.CANCELLED;

      // 5. Create History Entry
      const history = new OrderStatusHistory();
      history.orderId = order.id;
      history.status = OrderStatus.CANCELLED;
      history.remark = 'Cancelled by customer';

      // 6. Save updates
      if (inventoryUpdates.length > 0) {
        await manager.save(Inventory, inventoryUpdates);
      }
      await manager.save(OrderStatusHistory, history);
      return manager.save(Order, order);
    });
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
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Check if status is a valid OrderStatus
      if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
        throw new BadRequestException('Invalid order status');
      }

      const newStatus = status as OrderStatus;
      
      if (order.status === newStatus) {
        return order; // No change
      }

      order.status = newStatus;

      // Also update paymentStatus to PAID if status is DELIVERED and payment method is COD
      if (newStatus === OrderStatus.DELIVERED && order.paymentMethod === PaymentMethod.COD) {
        order.paymentStatus = PaymentStatus.PAID;
      }

      const history = new OrderStatusHistory();
      history.orderId = order.id;
      history.status = newStatus;
      history.remark = `Status updated by Admin (${adminId})`;

      await manager.save(OrderStatusHistory, history);

      // In-app notification for the customer (best-effort inside the same tx)
      const customerNotification = manager.create(Notification, {
        userId: order.userId,
        title: 'Order update',
        message: `Your order #${order.id.slice(0, 8)} is now ${newStatus.replace(/_/g, ' ').toLowerCase()}.`,
        type: NotificationType.ORDER_UPDATE,
        data: { orderId: order.id, status: newStatus },
      });
      await manager.save(customerNotification);

      return manager.save(Order, order);
    });
  }
}
