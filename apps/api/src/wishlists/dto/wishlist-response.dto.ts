import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from '../../catalog/dto/product-response.dto.js';

export class WishlistItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  productId: string;

  @ApiProperty({ type: ProductResponseDto })
  product: ProductResponseDto;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;
}
