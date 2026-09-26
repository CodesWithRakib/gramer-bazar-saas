import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductRequestStatus } from '../enums/product-request-status.enum.js';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';
import { ProductResponseDto } from '../../catalog/dto/product-response.dto.js';

export class ProductRequestHistoryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e' })
  productRequestId: string;

  @ApiPropertyOptional({ enum: ProductRequestStatus, nullable: true })
  fromStatus: ProductRequestStatus | null;

  @ApiProperty({ enum: ProductRequestStatus })
  toStatus: ProductRequestStatus;

  @ApiPropertyOptional({ example: 'Approved for procurement', nullable: true })
  note: string | null;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;
}

export class ProductRequestResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Product request UUID' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', description: 'Requestor User UUID' })
  userId: string;

  @ApiPropertyOptional({ type: () => UserResponseDto, description: 'Requestor details' })
  user?: UserResponseDto;

  @ApiProperty({ example: 'Organic Dragon Fruit', description: 'Name of the requested item' })
  requestedProductName: string;

  @ApiPropertyOptional({ example: 'Looking for red dragon fruit 5kg fresh harvest', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ example: 'Prefer Dinajpur local farm source', nullable: true })
  preferredInformation: string | null;

  @ApiProperty({ enum: ProductRequestStatus, example: ProductRequestStatus.PENDING })
  status: ProductRequestStatus;

  @ApiPropertyOptional({ example: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f', nullable: true, description: 'Catalog product linked by admin if fulfilled' })
  linkedProductId: string | null;

  @ApiPropertyOptional({ type: () => ProductResponseDto, nullable: true, description: 'Catalog product details if fulfilled' })
  linkedProduct?: ProductResponseDto | null;

  @ApiPropertyOptional({ example: 'Procured and listed in catalog', nullable: true })
  adminNotes: string | null;

  @ApiPropertyOptional({ type: [ProductRequestHistoryResponseDto], description: 'Status progression history' })
  statusHistory?: ProductRequestHistoryResponseDto[];

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}
