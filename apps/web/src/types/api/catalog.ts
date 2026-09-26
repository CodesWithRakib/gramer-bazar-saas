import type { Schema } from './common.js';

export type Category = Schema<'CategoryResponseDto'>;
export type Brand = Schema<'BrandResponseDto'>;
export type ProductImage = Schema<'ProductImageResponseDto'>;
export type ProductVariant = Schema<'ProductVariantResponseDto'>;
export type Product = Schema<'ProductResponseDto'>;
export type ProductSearchResult = Schema<'ProductSearchResultResponseDto'>;
export type CartValidationItem = Schema<'ValidatedCartItemResponseDto'>;
export type CartValidationResult = Schema<'CartValidationResultDto'>;
export type CategorySection = Schema<'CategorySectionResponseDto'>;
export type ImportLog = Schema<'ImportLogResponseDto'>;

export type CreateCategoryRequest = Schema<'CreateCategoryDto'>;
export type UpdateCategoryRequest = Schema<'UpdateCategoryDto'>;
export type CreateBrandRequest = Schema<'CreateBrandDto'>;
export type UpdateBrandRequest = Schema<'UpdateBrandDto'>;
export type CreateProductRequest = Schema<'CreateProductDto'>;
export type UpdateProductRequest = Schema<'UpdateProductDto'>;
export type CreateProductVariantRequest = Schema<'CreateProductVariantDto'>;
export type UpdateProductVariantRequest = Schema<'UpdateProductVariantDto'>;
export type ReorderImagesRequest = Schema<'ReorderImagesDto'>;
