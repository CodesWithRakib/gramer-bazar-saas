import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../enums/product-status.enum.js';
import { CategoryResponseDto } from './category-response.dto.js';
import { BrandResponseDto } from './brand-response.dto.js';

export class ProductImageResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Image UUID' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', description: 'Product UUID' })
  productId: string;

  @ApiProperty({ example: 'https://storage.gramerbazar.com/products/potato.webp', description: 'Public image URL' })
  url: string;

  @ApiProperty({ example: 'products/potato.webp', description: 'Internal cloud storage key' })
  storagePath: string;

  @ApiProperty({ example: 'potato.webp', description: 'Filename' })
  filename: string;

  @ApiPropertyOptional({ example: 'fresh-potato.jpg', nullable: true })
  originalFilename?: string | null;

  @ApiPropertyOptional({ example: 'image/webp' })
  mimeType?: string;

  @ApiPropertyOptional({ example: 1048576, description: 'File size in bytes' })
  sizeBytes?: number;

  @ApiProperty({ example: true, description: 'Whether this is the primary thumbnail image' })
  isPrimary: boolean;

  @ApiProperty({ example: 0, description: 'Sorting order index' })
  sortOrder: number;

  @ApiPropertyOptional({ example: 'Fresh local potatoes', nullable: true, description: 'Accessibility alt text' })
  altText?: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class ProductVariantResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Variant UUID' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', description: 'Master product UUID' })
  productId: string;

  @ApiProperty({ example: '5 kg Pack', description: 'Variant name in English' })
  nameEn: string;

  @ApiProperty({ example: '৫ কেজি প্যাকেট', description: 'Variant name in Bengali' })
  nameBn: string;

  @ApiPropertyOptional({ example: 'POT-5KG', nullable: true })
  sku?: string | null;

  @ApiPropertyOptional({ example: 250, nullable: true, description: 'Variant price in BDT' })
  price?: number | null;

  @ApiPropertyOptional({ example: 230, nullable: true, description: 'Promotional discount price in BDT' })
  discountPrice?: number | null;

  @ApiPropertyOptional({ example: 50, description: 'Available variant stock' })
  stock?: number;

  @ApiPropertyOptional({ type: [String], nullable: true, description: 'Array of image URLs for this variant' })
  images?: string[] | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class ProductResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Product UUID' })
  id: string;

  @ApiProperty({ example: 'Organic Red Potato', description: 'Product title in English' })
  nameEn: string;

  @ApiProperty({ example: 'লাল আলু (জৈব)', description: 'Product title in Bengali' })
  nameBn: string;

  @ApiProperty({ example: 'organic-red-potato', description: 'Unique product URL slug' })
  slug: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', description: 'Primary Category UUID' })
  categoryId: string;

  @ApiPropertyOptional({ type: () => CategoryResponseDto, description: 'Primary category details' })
  category?: CategoryResponseDto;

  @ApiPropertyOptional({ example: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f', nullable: true, description: 'SubCategory UUID' })
  subCategoryId: string | null;

  @ApiPropertyOptional({ type: () => CategoryResponseDto, nullable: true, description: 'SubCategory details' })
  subCategory?: CategoryResponseDto | null;

  @ApiPropertyOptional({ example: 'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a', nullable: true, description: 'Brand UUID' })
  brandId: string | null;

  @ApiPropertyOptional({ type: () => BrandResponseDto, nullable: true, description: 'Brand details' })
  brand?: BrandResponseDto | null;

  @ApiPropertyOptional({ example: 'Naturally cultivated red potatoes from Dinajpur', nullable: true })
  shortDescriptionEn: string | null;

  @ApiPropertyOptional({ example: 'দিনাজপুরের খাঁটি ও বিষমুক্ত লাল আলু', nullable: true })
  shortDescriptionBn: string | null;

  @ApiPropertyOptional({ example: 'Detailed product description and nutritional value...', nullable: true })
  descriptionEn: string | null;

  @ApiPropertyOptional({ example: 'পুষ্টিগুণ ও সংরক্ষণ পদ্ধতি সম্পর্কিত বিস্তারিত বিবরণ...', nullable: true })
  descriptionBn: string | null;

  @ApiPropertyOptional({ example: 'POT-RED-001', nullable: true, description: 'Stock keeping unit barcode' })
  sku: string | null;

  @ApiPropertyOptional({ example: '8901234567890', nullable: true, description: 'GTIN/EAN barcode' })
  barcode: string | null;

  @ApiPropertyOptional({ example: 45, nullable: true, description: 'Selling price in BDT' })
  price: number | null;

  @ApiPropertyOptional({ example: 55, nullable: true, description: 'Original benchmark / compare-at price in BDT' })
  compareAtPrice: number | null;

  @ApiProperty({ example: 250, description: 'Total available stock in base unit' })
  stock: number;

  @ApiPropertyOptional({ example: 'kg', nullable: true, description: 'Selling measurement unit (e.g. kg, liter, piece)' })
  unit: string | null;

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.PUBLISHED, description: 'Publication status' })
  status: ProductStatus;

  @ApiProperty({ example: true, description: 'Whether featured on marketplace homepage' })
  isFeatured: boolean;

  @ApiProperty({ example: true, description: 'Whether active and visible in catalog' })
  isActive: boolean;

  @ApiPropertyOptional({ example: 'manual', nullable: true, description: 'Source ingestion mechanism' })
  source: string | null;

  @ApiProperty({ type: [ProductImageResponseDto], description: 'Gallery of product images' })
  images: ProductImageResponseDto[];

  @ApiPropertyOptional({ type: [ProductVariantResponseDto], description: 'Optional product variation options' })
  variants?: ProductVariantResponseDto[];

  @ApiPropertyOptional({ example: 4.8, description: 'Aggregate review rating out of 5.0' })
  averageRating?: number;

  @ApiPropertyOptional({ example: 38, description: 'Total number of customer reviews' })
  totalReviews?: number;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class ProductSearchResultResponseDto {
  @ApiProperty({ type: [ProductResponseDto], description: 'Matched product results' })
  products: ProductResponseDto[];

  @ApiProperty({ type: [CategoryResponseDto], description: 'Matched category recommendations' })
  categories: CategoryResponseDto[];

  @ApiProperty({ type: [BrandResponseDto], description: 'Matched brand recommendations' })
  brands: BrandResponseDto[];
}

export class ImportResultResponseDto {
  @ApiProperty({ example: true, description: 'Whether the bulk import succeeded' })
  success: boolean;

  @ApiProperty({ example: 150, description: 'Total rows processed from import file' })
  totalProcessed: number;

  @ApiProperty({ example: 145, description: 'Number of products created or updated' })
  successful: number;

  @ApiProperty({ example: 5, description: 'Number of rows failed due to validation' })
  failed: number;

  @ApiProperty({ example: [], description: 'List of failure reason messages per row', type: [String] })
  errors: string[];
}

export class CartValidationItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  productId: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 50 })
  unitPrice: number;

  @ApiProperty({ example: 100 })
  totalPrice: number;

  @ApiProperty({ example: true })
  isAvailable: boolean;
}

export class CartValidationResponseDto {
  @ApiProperty({ example: true, description: 'Whether all cart items are valid and in stock' })
  isValid: boolean;

  @ApiProperty({ example: 450, description: 'Validated subtotal in BDT' })
  subtotal: number;

  @ApiProperty({ example: 40, description: 'Calculated delivery fee in BDT' })
  deliveryFee: number;

  @ApiProperty({ example: 490, description: 'Grand total payable in BDT' })
  total: number;

  @ApiProperty({ type: [CartValidationItemDto], description: 'Item level availability breakdown' })
  items: CartValidationItemDto[];
}
