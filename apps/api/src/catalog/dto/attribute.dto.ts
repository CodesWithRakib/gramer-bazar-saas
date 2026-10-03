import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttributeDataType } from '../enums/attribute-data-type.enum.js';

export class AttributeOptionDto {
  @ApiPropertyOptional({ description: 'Existing option UUID when updating' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ example: 'AM5', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  value: string;

  @ApiPropertyOptional({ example: 'এএম৫', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  valueBn?: string;

  @ApiPropertyOptional({ example: 'am5', description: 'Defaults to a slug of the value' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  slug?: string;

  @ApiPropertyOptional({
    example: '#1a1a1a',
    description: 'Optional swatch colour for colour-like option sets',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
    message: 'hexColor must be a hex colour such as #1a1a1a',
  })
  hexColor?: string;

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

export class CreateAttributeDto {
  @ApiProperty({ example: 'Socket', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nameEn: string;

  @ApiProperty({ example: 'সকেট', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameBn: string;

  @ApiPropertyOptional({ example: 'socket' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  slug?: string;

  @ApiPropertyOptional({ enum: AttributeDataType, default: AttributeDataType.TEXT })
  @IsOptional()
  @IsEnum(AttributeDataType)
  dataType?: AttributeDataType;

  @ApiPropertyOptional({ example: 'GHz' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  unit?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isVariantAxis?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [AttributeOptionDto], description: 'Selectable options' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeOptionDto)
  options?: AttributeOptionDto[];
}

export class UpdateAttributeDto {
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

  @ApiPropertyOptional({ enum: AttributeDataType })
  @IsOptional()
  @IsEnum(AttributeDataType)
  dataType?: AttributeDataType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVariantAxis?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: [AttributeOptionDto],
    description: 'When provided, replaces the attribute option list',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeOptionDto)
  options?: AttributeOptionDto[];
}

/** One attribute mapping row when configuring a product type. */
export class ProductTypeAttributeMappingDto {
  @ApiProperty({ description: 'Attribute UUID' })
  @IsUUID()
  attributeId: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @ApiPropertyOptional({ example: 'Memory' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specGroup?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class SetProductTypeAttributesDto {
  @ApiProperty({ type: [ProductTypeAttributeMappingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTypeAttributeMappingDto)
  mappings: ProductTypeAttributeMappingDto[];
}

/** A single structured spec value submitted with a product. */
export class ProductAttributeValueInputDto {
  @ApiPropertyOptional({ description: 'Attribute UUID (preferred)' })
  @IsOptional()
  @IsUUID()
  attributeId?: string;

  @ApiPropertyOptional({ description: 'Attribute slug (alternative to attributeId)' })
  @IsOptional()
  @IsString()
  attributeSlug?: string;

  @ApiPropertyOptional({ description: 'Selected option UUID' })
  @IsOptional()
  @IsUUID()
  optionId?: string;

  @ApiPropertyOptional({ description: 'Selected option slug' })
  @IsOptional()
  @IsString()
  optionSlug?: string;

  @ApiPropertyOptional({ description: 'Text value' })
  @IsOptional()
  @IsString()
  valueText?: string;

  @ApiPropertyOptional({ description: 'Numeric value' })
  @IsOptional()
  valueNumber?: number;

  @ApiPropertyOptional({ description: 'Boolean value' })
  @IsOptional()
  @IsBoolean()
  valueBoolean?: boolean;
}
