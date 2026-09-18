import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerPortalService } from './seller-portal.service.js';
import { SellerPortalController } from './seller-portal.controller.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from '../orders/entities/order-item.entity.js';
import { ProductVariant } from '../catalog/entities/product-variant.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Shop,
      SellerProduct,
      Inventory,
      Order,
      OrderItem,
      ProductVariant,
    ]),
  ],
  controllers: [SellerPortalController],
  providers: [SellerPortalService],
})
export class SellerPortalModule {}
