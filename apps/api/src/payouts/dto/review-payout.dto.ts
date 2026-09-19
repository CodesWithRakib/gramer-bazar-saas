import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PayoutStatus } from '../entities/payout-request.entity.js';

export class ReviewPayoutDto {
  @ApiProperty({ enum: [PayoutStatus.APPROVED, PayoutStatus.REJECTED] })
  @IsEnum([PayoutStatus.APPROVED, PayoutStatus.REJECTED])
  status: PayoutStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  adminNote?: string;
}
