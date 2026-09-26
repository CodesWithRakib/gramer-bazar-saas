import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductVariantResponseDto } from '../../catalog/dto/product-response.dto.js';
import { CategoryResponseDto } from '../../catalog/dto/category-response.dto.js';

export class InventorySummaryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 45, description: 'Available unsold stock' })
  quantity: number;

  @ApiProperty({ example: 5, description: 'Quantity currently reserved in pending checkouts' })
  reservedQuantity: number;

  @ApiProperty({ example: 5, description: 'Low stock warning threshold' })
  lowStockThreshold: number;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class SellerProductResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Seller product listing UUID' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', description: 'Shop UUID' })
  shopId: string;

  @ApiProperty({ example: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f', description: 'Product variant UUID' })
  productVariantId: string;

  @ApiPropertyOptional({ type: () => ProductVariantResponseDto, description: 'Associated master variant details' })
  productVariant?: ProductVariantResponseDto;

  @ApiProperty({ example: 120, description: 'Selling price set by seller in BDT' })
  price: number;

  @ApiPropertyOptional({ example: 105, nullable: true, description: 'Promotional discount price in BDT' })
  discountPrice: number | null;

  @ApiPropertyOptional({ example: 'SELLER-SKU-001', nullable: true, description: 'Custom merchant inventory SKU' })
  sellerSku: string | null;

  @ApiProperty({ example: false, description: 'Whether seller has regulatory permit approval for this item' })
  isRegulatedApproved: boolean;

  @ApiProperty({ example: true, description: 'Whether the product is listed and active in shop' })
  isActive: boolean;

  @ApiPropertyOptional({ type: InventorySummaryDto, description: 'Inventory stock level summary' })
  inventory?: InventorySummaryDto;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class ShopProductsResponseDto {
  @ApiProperty({ type: [SellerProductResponseDto], description: 'List of seller products' })
  products: SellerProductResponseDto[];

  @ApiProperty({ type: [CategoryResponseDto], description: 'Categories represented in this shop inventory' })
  categories: CategoryResponseDto[];

  @ApiProperty({ example: 45, description: 'Total matched products' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 3, description: 'Total pages' })
  totalPages: number;
}
