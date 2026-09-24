import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity.js';
import { Brand } from './entities/brand.entity.js';
import { Product } from './entities/product.entity.js';
import { ProductVariant } from './entities/product-variant.entity.js';
import { ProductImage } from './entities/product-image.entity.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';
import { CategoriesController } from './categories/categories.controller.js';
import { CategoriesService } from './categories/categories.service.js';
import { BrandsController } from './brands/brands.controller.js';
import { BrandsService } from './brands/brands.service.js';
import { ProductsController } from './products/products.controller.js';
import { ProductsService } from './products/products.service.js';
import { ProductImageService } from './products/product-image.service.js';
import { ProductVariantsController } from './product-variants/product-variants.controller.js';
import { ProductVariantsService } from './product-variants/product-variants.service.js';

import { ImportLog } from './importer/entities/import-log.entity.js';
import { ProductImporterController } from './importer/product-importer.controller.js';
import { ProductImporterService } from './importer/product-importer.service.js';
import { DummyJsonAdapter } from './importer/adapters/dummyjson.adapter.js';
import { OpenFoodFactsAdapter } from './importer/adapters/openfoodfacts.adapter.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Brand,
      Product,
      ProductVariant,
      ProductImage,
      SellerProduct,
      Shop,
      Inventory,
      ImportLog,
    ]),
  ],
  controllers: [
    CategoriesController,
    BrandsController,
    ProductsController,
    ProductVariantsController,
    ProductImporterController,
  ],
  providers: [
    CategoriesService,
    BrandsService,
    ProductsService,
    ProductImageService,
    ProductVariantsService,
    ProductImporterService,
    DummyJsonAdapter,
    OpenFoodFactsAdapter,
  ],
  exports: [
    TypeOrmModule,
    ProductsService,
    ProductImageService,
    CategoriesService,
    ProductImporterService,
  ],
})
export class CatalogModule {}
