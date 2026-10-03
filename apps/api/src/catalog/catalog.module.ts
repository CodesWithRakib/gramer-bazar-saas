import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity.js';
import { Brand } from './entities/brand.entity.js';
import { Product } from './entities/product.entity.js';
import { ProductVariant } from './entities/product-variant.entity.js';
import { ProductImage } from './entities/product-image.entity.js';
import { ProductType } from './entities/product-type.entity.js';
import { Attribute } from './entities/attribute.entity.js';
import { AttributeOption } from './entities/attribute-option.entity.js';
import { ProductTypeAttribute } from './entities/product-type-attribute.entity.js';
import { ProductAttributeValue } from './entities/product-attribute-value.entity.js';
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
import { ProductAttributeValuesService } from './products/product-attribute-values.service.js';
import { ProductVariantsController } from './product-variants/product-variants.controller.js';
import { ProductVariantsService } from './product-variants/product-variants.service.js';
import { AttributesController } from './attributes/attributes.controller.js';
import { AttributesService } from './attributes/attributes.service.js';
import { ProductTypesController } from './product-types/product-types.controller.js';
import { ProductTypesService } from './product-types/product-types.service.js';

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
      ProductType,
      Attribute,
      AttributeOption,
      ProductTypeAttribute,
      ProductAttributeValue,
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
    AttributesController,
    ProductTypesController,
    ProductImporterController,
  ],
  providers: [
    CategoriesService,
    BrandsService,
    ProductsService,
    ProductImageService,
    ProductAttributeValuesService,
    ProductVariantsService,
    AttributesService,
    ProductTypesService,
    ProductImporterService,
    DummyJsonAdapter,
    OpenFoodFactsAdapter,
  ],
  exports: [
    TypeOrmModule,
    ProductsService,
    ProductImageService,
    ProductAttributeValuesService,
    CategoriesService,
    AttributesService,
    ProductTypesService,
    ProductImporterService,
  ],
})
export class CatalogModule {}
