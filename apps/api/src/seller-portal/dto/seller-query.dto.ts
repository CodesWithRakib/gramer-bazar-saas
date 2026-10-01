import { Type } from 'class-transformer';
import { IsBooleanString, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../orders/enums/order-status.enum.js';

const MAX_PAGE_SIZE = 100;

export class SellerPaginationQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number;
}

export class SellerProductQueryDto extends SellerPaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by product name, SKU or seller SKU' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ['ALL', 'ACTIVE', 'INACTIVE'],
    default: 'ALL',
    description: 'Listing visibility filter',
  })
  @IsOptional()
  @IsIn(['ALL', 'ACTIVE', 'INACTIVE'])
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE';

  @ApiPropertyOptional({
    enum: ['ALL', 'LOW_STOCK', 'IN_STOCK', 'OUT_OF_STOCK'],
    default: 'ALL',
    description: 'Stock level filter',
  })
  @IsOptional()
  @IsIn(['ALL', 'LOW_STOCK', 'IN_STOCK', 'OUT_OF_STOCK'])
  stock?: 'ALL' | 'LOW_STOCK' | 'IN_STOCK' | 'OUT_OF_STOCK';

  @ApiPropertyOptional({ description: 'Filter listings by category UUID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ['newest', 'oldest', 'price_asc', 'price_desc'], default: 'newest' })
  @IsOptional()
  @IsIn(['newest', 'oldest', 'price_asc', 'price_desc'])
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
}

export class SellerOrderQueryDto extends SellerPaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by order id, customer name or phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: OrderStatus, description: 'Filter by order status' })
  @IsOptional()
  @IsIn(Object.values(OrderStatus))
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Only orders awaiting action (PENDING/CONFIRMED/PROCESSING)',
  })
  @IsOptional()
  @IsBooleanString()
  needsAction?: string;
}

export class SellerReviewQueryDto extends SellerPaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by product name or review text' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 5, description: 'Filter by star rating' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ enum: ['ALL', 'REPLIED', 'UNREPLIED'], default: 'ALL' })
  @IsOptional()
  @IsIn(['ALL', 'REPLIED', 'UNREPLIED'])
  replyState?: 'ALL' | 'REPLIED' | 'UNREPLIED';
}
