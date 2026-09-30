import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerProduct } from './entities/seller-product.entity.js';
import { Inventory } from './entities/inventory.entity.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { SellerProductsController } from './seller-products/seller-products.controller.js';
import { SellerProductsService } from './seller-products/seller-products.service.js';
import { InventoryController } from './inventory/inventory.controller.js';
import { InventoryService } from './inventory/inventory.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([SellerProduct, Inventory, Shop])],
  controllers: [SellerProductsController, InventoryController],
  providers: [SellerProductsService, InventoryService],
  exports: [TypeOrmModule],
})
export class InventoryModule {}
