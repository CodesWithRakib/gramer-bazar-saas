import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity.js';
import { Brand } from './entities/brand.entity.js';
import { Product } from './entities/product.entity.js';
import { ProductVariant } from './entities/product-variant.entity.js';
import { CategoriesController } from './categories/categories.controller.js';
import { CategoriesService } from './categories/categories.service.js';
import { BrandsController } from './brands/brands.controller.js';
import { BrandsService } from './brands/brands.service.js';
import { ProductsController } from './products/products.controller.js';
import { ProductsService } from './products/products.service.js';
import { ProductVariantsController } from './product-variants/product-variants.controller.js';
import { ProductVariantsService } from './product-variants/product-variants.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Brand, Product, ProductVariant])],
  controllers: [CategoriesController, BrandsController, ProductsController, ProductVariantsController],
  providers: [CategoriesService, BrandsService, ProductsService, ProductVariantsService],
  exports: [TypeOrmModule],
})
export class CatalogModule {}
