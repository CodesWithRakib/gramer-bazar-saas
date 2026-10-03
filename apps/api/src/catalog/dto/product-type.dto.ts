import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttributeDataType } from '../enums/attribute-data-type.enum.js';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductTypeDto {
  @ApiProperty({ description: 'Category UUID this product type belongs to' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'Processor', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nameEn: string;

  @ApiProperty({ example: 'প্রসেসর', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameBn: string;

  @ApiPropertyOptional({ example: 'processor' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionBn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductTypeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nameEn?: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameBn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionBn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AttributeOptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  attributeId: string;

  @ApiProperty()
  value: string;

  @ApiPropertyOptional({ nullable: true })
  valueBn: string | null;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  isActive: boolean;
}

export class AttributeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nameEn: string;

  @ApiProperty()
  nameBn: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ enum: AttributeDataType })
  dataType: AttributeDataType;

  @ApiPropertyOptional({ nullable: true })
  unit: string | null;

  @ApiProperty()
  isFilterable: boolean;

  @ApiProperty()
  isVariantAxis: boolean;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional({ type: [AttributeOptionResponseDto] })
  options?: AttributeOptionResponseDto[];
}

export class ProductTypeAttributeResponseDto {
  @ApiProperty()
  attributeId: string;

  @ApiProperty()
  isRequired: boolean;

  @ApiProperty()
  isFilterable: boolean;

  @ApiPropertyOptional({ nullable: true })
  specGroup: string | null;

  @ApiProperty()
  sortOrder: number;

  @ApiPropertyOptional({ type: () => AttributeResponseDto })
  attribute?: AttributeResponseDto;
}

export class ProductTypeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  nameEn: string;

  @ApiProperty()
  nameBn: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional({ nullable: true })
  descriptionEn: string | null;

  @ApiPropertyOptional({ nullable: true })
  descriptionBn: string | null;

  @ApiPropertyOptional({ nullable: true })
  icon: string | null;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional({ type: [ProductTypeAttributeResponseDto] })
  attributeMappings?: ProductTypeAttributeResponseDto[];
}
