import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductAttributeValueInputDto } from '../../catalog/dto/attribute.dto.js';

/**
 * Creates a new catalog product owned by the authenticated seller's shop:
 * the master `Product`, its default `ProductVariant`, the `SellerProduct`
 * listing and the `Inventory` balance are all written in one transaction.
 */
export class CreateSellerProductDto {
  @ApiProperty({ example: 'Fresh Organic Red Potato', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameEn: string;

  @ApiProperty({ example: 'তাজা জৈব লাল আলু', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameBn: string;

  @ApiProperty({ description: 'Leaf category UUID the product belongs to' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ description: 'Optional sub-category UUID' })
  @IsOptional()
  @IsUUID()
  subCategoryId?: string;

  @ApiPropertyOptional({ description: 'Optional brand UUID' })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Product type UUID defining the attribute schema' })
  @IsOptional()
  @IsUUID()
  productTypeId?: string;

  @ApiPropertyOptional({
    type: [ProductAttributeValueInputDto],
    description: 'Structured specification values for this product',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeValueInputDto)
  attributeValues?: ProductAttributeValueInputDto[];

  @ApiPropertyOptional({ description: 'Short English description', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescriptionEn?: string;

  @ApiPropertyOptional({ description: 'Short Bangla description', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescriptionBn?: string;

  @ApiPropertyOptional({ description: 'Full English description', maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Full Bangla description', maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  descriptionBn?: string;

  @ApiProperty({ example: 120, description: 'Regular selling price in BDT' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(10_000_000)
  price: number;

  @ApiPropertyOptional({
    example: 99,
    description: 'Discounted selling price in BDT (must be lower than price)',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10_000_000)
  discountPrice?: number;

  @ApiProperty({ example: 50, description: 'Initial stock quantity' })
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  quantity: number;

  @ApiPropertyOptional({ example: 5, description: 'Low-stock alert threshold' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ example: 'POT-RED-001', description: 'Base SKU' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({ example: 'kg', description: 'Selling unit (kg, piece, litre…)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @ApiPropertyOptional({ example: true, description: 'Publish immediately', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
