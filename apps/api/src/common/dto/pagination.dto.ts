import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_CURSOR_LIMIT: 30,
  MAX_CURSOR_LIMIT: 100,
} as const;

export class BaseListQueryDto {
  @ApiPropertyOptional({ description: 'Search term for text search (Standardized parameter)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Legacy search term. Use q instead.', deprecated: true })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Sort criteria (e.g., createdAt:desc)' })
  @IsOptional()
  @IsString()
  sort?: string;
}

export class OffsetPaginationDto extends BaseListQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    default: PAGINATION_CONFIG.DEFAULT_PAGE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = PAGINATION_CONFIG.DEFAULT_PAGE;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: PAGINATION_CONFIG.MAX_LIMIT,
    default: PAGINATION_CONFIG.DEFAULT_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION_CONFIG.MAX_LIMIT)
  limit?: number = PAGINATION_CONFIG.DEFAULT_LIMIT;
}

export class CursorPaginationDto extends BaseListQueryDto {
  @ApiPropertyOptional({ description: 'Cursor for the next page of results' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Number of items to fetch',
    minimum: 1,
    maximum: PAGINATION_CONFIG.MAX_CURSOR_LIMIT,
    default: PAGINATION_CONFIG.DEFAULT_CURSOR_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION_CONFIG.MAX_CURSOR_LIMIT)
  limit?: number = PAGINATION_CONFIG.DEFAULT_CURSOR_LIMIT;
}
