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

import { OrderStatus, PaymentStatus } from './enums/order-status.enum.js';
import { Address } from '../addresses/entities/address.entity.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';

@Injectable()
export class OrdersService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async checkout(userId: string, checkoutDto: CheckoutDto) {
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

      // 2. Fetch SellerProducts & Inventory in bulk with Row Lock
      const itemIds = checkoutDto.items.map((i) => i.sellerProductId);
      const dbProducts = await manager.find(SellerProduct, {
        where: { id: In(itemIds), isActive: true },
        relations: ['inventory'],
        lock: { mode: 'pessimistic_write' }, // Lock these rows to prevent race conditions during checkout
      });

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

      // 4. Calculate Delivery & Total (Flat 50 BDT for now, configurable later)
      const deliveryFee = 50;
      const discount = 0;
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

      // 6. Save all within transaction
      await manager.save(Inventory, inventoryUpdates);
      const savedOrder = await manager.save(Order, order);

      return savedOrder;
    });
  }
}
