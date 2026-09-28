import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { NotificationType, NotificationPriority } from '../entities/notification.entity.js';

export class NotificationResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  userId: string;

  @ApiProperty({ example: 'Order Dispatched' })
  title: string;

  @ApiProperty({
    example: 'Your order #ORD-12345 has been picked up by the delivery rider.',
  })
  message: string;

  @ApiPropertyOptional({
    example: 'notifications.delivery_started.title',
    nullable: true,
  })
  titleKey?: string | null;

  @ApiPropertyOptional({
    example: 'notifications.delivery_started.message',
    nullable: true,
  })
  messageKey?: string | null;

  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.ORDER_STATUS_CHANGED,
  })
  type: NotificationType;

  @ApiProperty({
    enum: NotificationPriority,
    example: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @ApiProperty({ example: false })
  isRead: boolean;

  @ApiPropertyOptional({ example: '2026-09-26T10:15:00.000Z', nullable: true })
  readAt?: string | null;

  @ApiPropertyOptional({
    example: { orderId: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' },
    nullable: true,
  })
  data?: Record<string, unknown> | null;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;
}

export class UnreadCountResponseDto {
  @ApiProperty({ example: 4, description: 'Number of unread notifications' })
  count: number;
}

export class QueryNotificationsDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  unreadOnly?: boolean;
}
