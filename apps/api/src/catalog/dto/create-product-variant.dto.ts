import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength, IsUUID, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductVariantDto {
  @ApiProperty({ description: 'Parent Product ID' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'English name of the variant (e.g., Red XL)', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nameEn: string;

  @ApiProperty({ description: 'Bangla name of the variant', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameBn: string;

  @ApiProperty({ description: 'Global SKU for this specific variant' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiPropertyOptional({ description: 'Array of image URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'JSON object of attributes (color, size, etc.)' })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Whether the variant is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
