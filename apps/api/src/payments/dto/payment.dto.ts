import { IsUUID, IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentStatus } from '../enums/payment-status.enum.js';

export class InitiatePaymentDto {
  @ApiProperty({ description: 'Order UUID to pay for' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: 'Language code for redirect (en or bn)', required: false })
  @IsString()
  @IsOptional()
  lang?: string;
}

export class PaymentAdminQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: PaymentStatus, required: false })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  provider?: string;
}
