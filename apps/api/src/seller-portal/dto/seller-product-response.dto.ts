import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ProductSpecGroup } from '../../catalog/products/product-attribute-values.service.js';

export class SellerProductImageDto {
  @ApiProperty({ description: 'Image UUID' })
  id: string;

  @ApiProperty({ description: 'Public image URL' })
  url: string;

  @ApiProperty({ description: 'Internal storage key', example: 'seller/products/<id>/<file>.webp' })
  storagePath: string;

  @ApiProperty({ description: 'Stored file name' })
  filename: string;

  @ApiProperty({ description: 'Detected MIME type', example: 'image/webp' })
  mimeType: string;

  @ApiProperty({ description: 'Stored file size in bytes' })
  sizeBytes: number;

  @ApiProperty({ description: 'Whether this is the product thumbnail' })
  isPrimary: boolean;

  @ApiProperty({ description: 'Display order index' })
  sortOrder: number;

  @ApiProperty({ type: String, nullable: true, description: 'Accessibility alt text' })
  altText: string | null;
}

export class SellerProductDetailDto {
  @ApiProperty({ description: 'Seller listing UUID' })
  id: string;

  @ApiProperty({ description: 'Shop UUID' })
  shopId: string;

  @ApiProperty({ description: 'Master product variant UUID' })
  productVariantId: string;

  @ApiProperty({ description: 'Master product UUID' })
  productId: string;

  @ApiProperty({ description: 'Whether the seller created (and owns) the master product' })
  isOwned: boolean;

  @ApiProperty({ example: 'Fresh Organic Red Potato' })
  nameEn: string;

  @ApiProperty({ example: 'তাজা জৈব লাল আলু' })
  nameBn: string;

  @ApiPropertyOptional({ nullable: true })
  shortDescriptionEn?: string | null;

  @ApiPropertyOptional({ nullable: true })
  shortDescriptionBn?: string | null;

  @ApiPropertyOptional({ nullable: true })
  descriptionEn?: string | null;

  @ApiPropertyOptional({ nullable: true })
  descriptionBn?: string | null;

  @ApiPropertyOptional({ nullable: true })
  slug?: string | null;

  @ApiPropertyOptional({ nullable: true })
  sku?: string | null;

  @ApiPropertyOptional({ nullable: true })
  sellerSku?: string | null;

  @ApiPropertyOptional({ nullable: true })
  unit?: string | null;

  @ApiPropertyOptional({ nullable: true })
  categoryId?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Fresh Vegetables' })
  categoryNameEn?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'তাজা সবজি' })
  categoryNameBn?: string | null;

  @ApiPropertyOptional({ nullable: true })
  subCategoryId?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  subCategoryNameEn?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  subCategoryNameBn?: string | null;

  @ApiPropertyOptional({ nullable: true })
  brandId?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  brandNameEn?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  brandNameBn?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Product type UUID' })
  productTypeId?: string | null;

  @ApiPropertyOptional({
    description: 'Structured specification groups for this product',
    type: 'array',
  })
  specGroups?: ProductSpecGroup[];

  @ApiProperty({ example: 120, description: 'Regular price in BDT' })
  price: number;

  @ApiProperty({ type: Number, nullable: true, example: 99 })
  discountPrice: number | null;

  @ApiProperty({ example: 99, description: 'Effective selling price after discount' })
  effectivePrice: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 42 })
  quantity: number;

  @ApiProperty({ example: 3 })
  reservedQuantity: number;

  @ApiProperty({ example: 5 })
  lowStockThreshold: number;

  @ApiProperty({ example: 'LOW', enum: ['OUT_OF_STOCK', 'LOW', 'IN_STOCK'] })
  stockState: 'OUT_OF_STOCK' | 'LOW' | 'IN_STOCK';

  @ApiProperty({ example: false, description: 'Whether this listing is low on stock' })
  isLowStock: boolean;

  @ApiProperty({ type: [SellerProductImageDto] })
  images: SellerProductImageDto[];

  @ApiProperty({ example: 12, description: 'Units sold across completed orders' })
  totalSold: number;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class SellerProductListMetaDto {
  @ApiProperty({ example: 48 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class SellerProductListDto {
  @ApiProperty({ type: [SellerProductDetailDto] })
  data: SellerProductDetailDto[];

  @ApiProperty({ type: SellerProductListMetaDto })
  meta: SellerProductListMetaDto;

  @ApiProperty({ example: 4, description: 'Listings at or below their low-stock threshold' })
  lowStockCount: number;

  @ApiProperty({ example: 2, description: 'Listings with zero available stock' })
  outOfStockCount: number;
}
