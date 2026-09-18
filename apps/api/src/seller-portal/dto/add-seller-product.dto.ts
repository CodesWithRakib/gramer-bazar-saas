import { IsUUID, IsNumber, IsOptional, IsBoolean, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddSellerProductDto {
  @ApiProperty()
  @IsUUID()
  productVariantId: string;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  discountPrice?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sellerSku?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;
}
