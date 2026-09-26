import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryStatus } from '../enums/delivery-status.enum.js';
import { OrderResponseDto } from '../../orders/dto/order-response.dto.js';

export class RiderSummaryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'Karim' })
  firstName: string;

  @ApiPropertyOptional({ example: 'Mia', nullable: true })
  lastName?: string | null;

  @ApiProperty({ example: '01712345678' })
  phone: string;
}

export class DeliveryHistoryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  deliveryId: string;

  @ApiProperty({ enum: DeliveryStatus, example: DeliveryStatus.ASSIGNED })
  status: DeliveryStatus;

  @ApiPropertyOptional({ example: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', nullable: true })
  changedById?: string | null;

  @ApiPropertyOptional({ example: 'Package picked up from seller', nullable: true })
  notes?: string | null;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;
}

export class DeliveryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  orderId: string;

  @ApiPropertyOptional({ type: () => OrderResponseDto })
  order?: OrderResponseDto;

  @ApiPropertyOptional({ example: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', nullable: true })
  riderId?: string | null;

  @ApiPropertyOptional({ type: RiderSummaryDto, nullable: true })
  rider?: RiderSummaryDto | null;

  @ApiProperty({ enum: DeliveryStatus, example: DeliveryStatus.ASSIGNED })
  status: DeliveryStatus;

  @ApiPropertyOptional({ example: '2026-09-26T10:00:00.000Z', nullable: true })
  assignedAt?: string | null;

  @ApiPropertyOptional({ example: '2026-09-26T10:30:00.000Z', nullable: true })
  pickupTime?: string | null;

  @ApiPropertyOptional({ example: '2026-09-26T11:15:00.000Z', nullable: true })
  deliveryTime?: string | null;

  @ApiPropertyOptional({ example: 'Handle with care', nullable: true })
  notes?: string | null;

  @ApiPropertyOptional({ example: 23.8103, nullable: true })
  currentLat?: number | null;

  @ApiPropertyOptional({ example: 90.4125, nullable: true })
  currentLng?: number | null;

  @ApiPropertyOptional({ example: '2026-09-26T10:45:00.000Z', nullable: true })
  lastLocationUpdatedAt?: string | null;

  @ApiProperty({ example: '2026-09-26T09:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-26T10:45:00.000Z' })
  updatedAt: string;
}

export class UpdateRiderLocationDto {
  @ApiProperty({ example: 23.8103, description: 'Current latitude (-90 to 90)' })
  lat: number;

  @ApiProperty({ example: 90.4125, description: 'Current longitude (-180 to 180)' })
  lng: number;
}
