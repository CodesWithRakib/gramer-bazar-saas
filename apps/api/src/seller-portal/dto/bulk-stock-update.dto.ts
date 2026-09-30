import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BulkStockItemDto {
  @ApiProperty({ description: 'Seller listing UUID' })
  @IsUUID()
  id: string;

  @ApiProperty({ example: 25, description: 'New total stock quantity' })
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  quantity: number;

  @ApiPropertyOptional({ example: 5, description: 'Optional low-stock alert threshold' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000)
  lowStockThreshold?: number;
}

export class BulkStockUpdateDto {
  @ApiProperty({ type: [BulkStockItemDto], description: 'Listings to update' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => BulkStockItemDto)
  items: BulkStockItemDto[];
}

export class BulkStockUpdateResultDto {
  @ApiProperty({ example: 7, description: 'Number of listings successfully updated' })
  updated: number;
}
