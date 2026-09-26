import { IsString, IsBoolean, IsOptional, IsDateString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFlashSaleItemDto {
  @ApiProperty({ example: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', description: 'Seller product UUID' })
  @IsString()
  sellerProductId: string;

  @ApiProperty({ example: 45.0, description: 'Discounted deal price' })
  @IsNumber()
  discountPrice: number;

  @ApiPropertyOptional({ example: 100, description: 'Quantity allocated for deal' })
  @IsNumber()
  @IsOptional()
  quantityAvailable?: number;
}

export class CreateFlashSaleDto {
  @ApiProperty({ example: 'Weekend Village Bazaar Rush' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2026-09-26T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-09-28T23:59:59.000Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/banner.jpg' })
  @IsString()
  @IsOptional()
  bannerImage?: string;

  @ApiPropertyOptional({ type: [CreateFlashSaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFlashSaleItemDto)
  @IsOptional()
  items?: CreateFlashSaleItemDto[];
}
