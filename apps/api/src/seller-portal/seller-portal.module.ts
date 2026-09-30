import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerPortalService } from './seller-portal.service.js';
import { SellerProductsService } from './seller-products.service.js';
import { SellerAnalyticsService } from './seller-analytics.service.js';
import { SellerReviewsService } from './seller-reviews.service.js';
import { SellerPortalController } from './seller-portal.controller.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from '../orders/entities/order-item.entity.js';
import { Product } from '../catalog/entities/product.entity.js';
import { ProductVariant } from '../catalog/entities/product-variant.entity.js';
import { ProductImage } from '../catalog/entities/product-image.entity.js';
import { Category } from '../catalog/entities/category.entity.js';
import { Brand } from '../catalog/entities/brand.entity.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import { PayoutRequest } from '../payouts/entities/payout-request.entity.js';
import { Review } from '../reviews/entities/review.entity.js';
import { Delivery } from '../deliveries/entities/delivery.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CatalogModule } from '../catalog/catalog.module.js';
import { OrdersModule } from '../orders/orders.module.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Shop,
      SellerProduct,
      Inventory,
      Order,
      OrderItem,
      Product,
      ProductVariant,
      ProductImage,
      Category,
      Brand,
      Wallet,
      PayoutRequest,
      Review,
      Delivery,
      User,
    ]),
    CatalogModule,
    OrdersModule,
    AuditLogsModule,
  ],
  controllers: [SellerPortalController],
  providers: [
    SellerPortalService,
    SellerProductsService,
    SellerAnalyticsService,
    SellerReviewsService,
  ],
  exports: [SellerPortalService, SellerProductsService, SellerAnalyticsService],
})
export class SellerPortalModule {}
