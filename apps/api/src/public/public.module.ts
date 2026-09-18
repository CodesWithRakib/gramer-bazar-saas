import { Module } from '@nestjs/common';
import { CategoriesController } from './categories/categories.controller.js';
import { CategoriesService } from './categories/categories.service.js';
import { CatalogController } from './catalog/catalog.controller.js';
import { CatalogService } from './catalog/catalog.service.js';
import { CatalogModule } from '../catalog/catalog.module.js';
import { InventoryModule } from '../inventory/inventory.module.js';
import { ShopsModule } from '../shops/shops.module.js';

@Module({
  imports: [CatalogModule, InventoryModule, ShopsModule],
  controllers: [CategoriesController, CatalogController],
  providers: [CategoriesService, CatalogService]
})
export class PublicModule {}
