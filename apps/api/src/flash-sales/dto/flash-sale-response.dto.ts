import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SellerProductResponseDto } from '../../inventory/dto/seller-product-response.dto.js';

export class FlashSaleItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  flashSaleId: string;

  @ApiProperty({ example: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f' })
  sellerProductId: string;

  @ApiProperty({ example: 45.0, description: 'Flash sale discounted unit price in BDT' })
  discountPrice: number;

  @ApiProperty({ example: 100, description: 'Total quantity allocated for flash sale discount' })
  quantityAvailable: number;

  @ApiProperty({ example: 38, description: 'Quantity sold under flash deal' })
  quantitySold: number;

  @ApiPropertyOptional({ type: () => SellerProductResponseDto })
  sellerProduct?: SellerProductResponseDto;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  updatedAt: string;
}

export class FlashSaleResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'Weekend Village Bazaar Rush' })
  name: string;

  @ApiProperty({ example: '2026-09-26T00:00:00.000Z' })
  startDate: string;

  @ApiProperty({ example: '2026-09-28T23:59:59.000Z' })
  endDate: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/flash-sale.jpg', nullable: true })
  bannerImage?: string | null;

  @ApiProperty({ type: [FlashSaleItemResponseDto] })
  items: FlashSaleItemResponseDto[];

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  updatedAt: string;
}
