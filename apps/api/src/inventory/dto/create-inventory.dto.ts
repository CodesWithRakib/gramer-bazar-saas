import { IsNotEmpty, IsOptional, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryDto {
  @ApiProperty({ description: 'Seller Product ID' })
  @IsUUID()
  @IsNotEmpty()
  sellerProductId: string;

  @ApiPropertyOptional({ description: 'Current available stock quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Threshold for low stock alerts' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;
}
