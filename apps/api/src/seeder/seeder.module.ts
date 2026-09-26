import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { User } from '../users/entities/user.entity.js';
import { RoleEntity } from '../roles/entities/role.entity.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { Category } from '../catalog/entities/category.entity.js';
import { Brand } from '../catalog/entities/brand.entity.js';
import { Product } from '../catalog/entities/product.entity.js';
import { ProductVariant } from '../catalog/entities/product-variant.entity.js';
import { ProductImage } from '../catalog/entities/product-image.entity.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';
import { Review } from '../reviews/entities/review.entity.js';
import { Division } from '../locations/entities/division.entity.js';
import { District } from '../locations/entities/district.entity.js';
import { Upazila } from '../locations/entities/upazila.entity.js';
import { Country } from '../locations/entities/country.entity.js';
import { Union } from '../locations/entities/union.entity.js';
import { Area } from '../locations/entities/area.entity.js';
import { Banner } from '../banners/entities/banner.entity.js';
import { FlashSale } from '../flash-sales/entities/flash-sale.entity.js';
import { FlashSaleItem } from '../flash-sales/entities/flash-sale-item.entity.js';
import { Address } from '../addresses/entities/address.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from '../orders/entities/order-item.entity.js';
import { OrderStatusHistory } from '../orders/entities/order-status-history.entity.js';
import { Payment } from '../payments/entities/payment.entity.js';
import { Delivery } from '../deliveries/entities/delivery.entity.js';
import { DeliveryHistory } from '../deliveries/entities/delivery-history.entity.js';
import { WishlistItem } from '../wishlists/entities/wishlist-item.entity.js';
import { Coupon } from '../coupons/entities/coupon.entity.js';
import { CouponUsage } from '../coupons/entities/coupon-usage.entity.js';
import { Notification } from '../notifications/entities/notification.entity.js';
import { Conversation } from '../chat/entities/conversation.entity.js';
import { Message } from '../chat/entities/message.entity.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import { WalletTransaction } from '../wallets/entities/wallet-transaction.entity.js';
import { DemandEvent } from '../analytics/entities/demand-event.entity.js';
import { SeederController } from './seeder.controller.js';
import { SeederService } from './seeder.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      RoleEntity,
      Shop,
      Category,
      Brand,
      Product,
      ProductVariant,
      ProductImage,
      SellerProduct,
      Inventory,
      Review,
      Division,
      District,
      Upazila,
      Country,
      Union,
      Area,
      Banner,
      FlashSale,
      FlashSaleItem,
      Address,
      Order,
      OrderItem,
      OrderStatusHistory,
      Payment,
      Delivery,
      DeliveryHistory,
      WishlistItem,
      Coupon,
      CouponUsage,
      Notification,
      Conversation,
      Message,
      Wallet,
      WalletTransaction,
      DemandEvent,
    ]),
  ],
  controllers: [SeederController],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
