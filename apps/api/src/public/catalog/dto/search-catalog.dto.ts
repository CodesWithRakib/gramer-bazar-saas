import { IsOptional, IsString, IsNumber, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchCatalogDto {
  @ApiPropertyOptional({ description: 'Search query (matches nameEn, nameBn)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by Category ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by Category Slug' })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({ description: 'Filter by SubCategory ID' })
  @IsOptional()
  @IsUUID()
  subCategoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by SubCategory Slug' })
  @IsOptional()
  @IsString()
  subCategorySlug?: string;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 20;

  @ApiPropertyOptional({ description: 'Filter by Brand ID' })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Filter by Product Type ID' })
  @IsOptional()
  @IsUUID()
  productTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by materialized category path prefix, e.g. electronics/computers-pc',
  })
  @IsOptional()
  @IsString()
  categoryPath?: string;

  @ApiPropertyOptional({
    description:
      'Dynamic attribute filters as a JSON object, e.g. {"socket":["am5"],"panel-type":["ips"]}',
  })
  @IsOptional()
  @IsString()
  attributes?: string;

  @ApiPropertyOptional({ description: 'Minimum average rating' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  minRating?: number;

  @ApiPropertyOptional({ description: 'Filter only in-stock products' })
  @IsOptional()
  @Type(() => Boolean)
  inStock?: boolean;

  @ApiPropertyOptional({
    description: 'Sort by field (e.g. price_asc, price_desc, newest)',
    default: 'newest',
  })
  @IsOptional()
  @IsString()
  sort: string = 'newest';
}
