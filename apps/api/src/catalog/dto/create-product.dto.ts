import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../enums/product-status.enum.js';

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

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ description: 'Whether the product is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
