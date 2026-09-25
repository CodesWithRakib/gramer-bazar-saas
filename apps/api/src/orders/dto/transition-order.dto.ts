import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum.js';

export class TransitionOrderDto {
  @ApiProperty({
    description: 'Target order status to transition to',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
  })
  @IsEnum(OrderStatus)
  targetStatus: OrderStatus;

  @ApiPropertyOptional({
    description: 'Reason for the transition (required for cancellations or failures)',
    example: 'Customer confirmed delivery address by phone',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
