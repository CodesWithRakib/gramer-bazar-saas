import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../entities/notification.entity.js';

export class NotificationResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  userId: string;

  @ApiProperty({ example: 'Order Dispatched' })
  title: string;

  @ApiProperty({ example: 'Your order #ORD-12345 has been picked up by the delivery rider.' })
  message: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.ORDER_UPDATE })
  type: NotificationType;

  @ApiProperty({ example: false })
  isRead: boolean;

  @ApiPropertyOptional({ example: '2026-09-26T10:15:00.000Z', nullable: true })
  readAt?: string | null;

  @ApiPropertyOptional({ example: { orderId: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' }, nullable: true })
  data?: Record<string, any> | null;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;
}

export class UnreadCountResponseDto {
  @ApiProperty({ example: 4, description: 'Number of unread notifications' })
  count: number;
}
