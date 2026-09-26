import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../enums/discount-type.enum.js';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CouponResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'EID50' })
  code: string;

  @ApiProperty({ enum: DiscountType, example: DiscountType.FIXED })
  discountType: DiscountType;

  @ApiProperty({ example: 50 })
  discountValue: number;

  @ApiProperty({ example: 500 })
  minOrderAmount: number;

  @ApiPropertyOptional({ example: 100, nullable: true })
  maxDiscountAmount?: number | null;

  @ApiPropertyOptional({ example: '2026-09-01T00:00:00.000Z', nullable: true })
  startDate?: string | null;

  @ApiPropertyOptional({ example: '2026-10-01T23:59:59.000Z', nullable: true })
  endDate?: string | null;

  @ApiPropertyOptional({ example: 500, nullable: true })
  usageLimit?: number | null;

  @ApiProperty({ example: 42 })
  usedCount: number;

  @ApiProperty({ example: 1 })
  customerUsageLimit: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', nullable: true })
  shopId?: string | null;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  updatedAt: string;
}

export class CouponValidationResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  couponId: string;

  @ApiProperty({ example: 'EID50' })
  code: string;

  @ApiProperty({ example: 50 })
  discountAmount: number;

  @ApiProperty({ example: 450 })
  subtotalAfterDiscount: number;
}

export class ValidateCouponRequestDto {
  @ApiProperty({ example: 'EID50', description: 'Coupon discount code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 500, description: 'Order subtotal before discount in BDT' })
  @IsNumber()
  @Min(0)
  subtotal: number;
}
