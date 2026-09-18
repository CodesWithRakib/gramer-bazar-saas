import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSellerProductDto {
  @ApiProperty({ description: 'Shop ID' })
  @IsUUID()
  @IsNotEmpty()
  shopId: string;

  @ApiProperty({ description: 'Product Variant ID from the global catalog' })
  @IsUUID()
  @IsNotEmpty()
  productVariantId: string;

  @ApiProperty({ description: 'Price of the product' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Discount price if applicable' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice?: number;

  @ApiPropertyOptional({ description: 'Seller specific SKU' })
  @IsOptional()
  @IsString()
  sellerSku?: string;

  @ApiPropertyOptional({ description: 'Whether the product is approved for regulated categories (Admin only)' })
  @IsOptional()
  @IsBoolean()
  isRegulatedApproved?: boolean;

  @ApiPropertyOptional({ description: 'Whether the seller product is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
