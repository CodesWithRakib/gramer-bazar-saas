import {
  IsArray,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsEnum,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../enums/product-status.enum.js';
import { ProductAttributeValueInputDto } from './attribute.dto.js';

export class CreateProductDto {
  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ description: 'Brand ID' })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiProperty({ description: 'English name of the product', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameEn: string;

  @ApiProperty({ description: 'Bangla name of the product', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameBn: string;

  @ApiProperty({ description: 'Unique URL slug for the product' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ description: 'English description' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Bangla description' })
  @IsOptional()
  @IsString()
  descriptionBn?: string;

  @ApiPropertyOptional({ description: 'SubCategory ID' })
  @IsOptional()
  @IsUUID()
  subCategoryId?: string;

  @ApiPropertyOptional({ description: 'Product Type ID (defines the attribute schema)' })
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

  @ApiPropertyOptional({ description: 'Short English description' })
  @IsOptional()
  @IsString()
  shortDescriptionEn?: string;

  @ApiPropertyOptional({ description: 'Short Bangla description' })
  @IsOptional()
  @IsString()
  shortDescriptionBn?: string;

  @ApiPropertyOptional({ description: 'SKU code' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: 'Barcode' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Price in BDT' })
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: 'Compare-at / original price in BDT' })
  @IsOptional()
  compareAtPrice?: number;

  @ApiPropertyOptional({ description: 'Stock quantity', default: 0 })
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ description: 'Unit (e.g., kg, piece, liter, pack)' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Featured product flag', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Data source (e.g. manual, dummyjson, openfoodfacts)' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Source product ID' })
  @IsOptional()
  @IsString()
  sourceProductId?: string;

  @ApiPropertyOptional({ description: 'Source URL' })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'Original source price' })
  @IsOptional()
  sourcePrice?: number;

  @ApiPropertyOptional({ description: 'Original source currency (e.g. USD, EUR)' })
  @IsOptional()
  @IsString()
  sourceCurrency?: string;

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ description: 'Whether the product is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
