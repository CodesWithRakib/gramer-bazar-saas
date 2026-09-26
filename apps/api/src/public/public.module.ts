import { Module } from '@nestjs/common';
import { PublicCategoriesController } from './categories/categories.controller.js';
import { CategoriesService } from './categories/categories.service.js';
import { PublicCatalogController } from './catalog/catalog.controller.js';
import { CatalogService } from './catalog/catalog.service.js';
import { CatalogModule } from '../catalog/catalog.module.js';
import { InventoryModule } from '../inventory/inventory.module.js';
import { ShopsModule } from '../shops/shops.module.js';

import { PublicCartController } from './cart/cart.controller.js';
import { CartService } from './cart/cart.service.js';

@Module({
  imports: [CatalogModule, InventoryModule, ShopsModule],
  controllers: [PublicCategoriesController, PublicCatalogController, PublicCartController],
  providers: [CategoriesService, CatalogService, CartService]
})
export class PublicModule {}
