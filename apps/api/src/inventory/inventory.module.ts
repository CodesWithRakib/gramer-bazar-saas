import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerProduct } from './entities/seller-product.entity.js';
import { Inventory } from './entities/inventory.entity.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { WarehouseHub } from './entities/warehouse-hub.entity.js';
import { HubStock } from './entities/hub-stock.entity.js';
import { StockTransfer } from './entities/stock-transfer.entity.js';

import { SellerProductsController } from './seller-products/seller-products.controller.js';
import { SellerProductsService } from './seller-products/seller-products.service.js';
import { InventoryController } from './inventory/inventory.controller.js';
import { InventoryService } from './inventory/inventory.service.js';
import { WarehouseHubController } from './controllers/warehouse-hub.controller.js';
import { WarehouseHubService } from './services/warehouse-hub.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SellerProduct,
      Inventory,
      Shop,
      WarehouseHub,
      HubStock,
      StockTransfer,
    ]),
  ],
  controllers: [
    SellerProductsController,
    InventoryController,
    WarehouseHubController,
  ],
  providers: [
    SellerProductsService,
    InventoryService,
    WarehouseHubService,
  ],
  exports: [TypeOrmModule, WarehouseHubService],
})
export class InventoryModule {}
