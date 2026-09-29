import { IsNumber, IsEnum, IsString, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PayoutMethod } from '../entities/payout-request.entity.js';

export class CreateRiderPayoutDto {
  @ApiProperty({ example: 1200, description: 'Amount to withdraw from rider earnings' })
  @IsNumber()
  @Min(100, { message: 'Minimum rider payout amount is 100' })
  amount: number;

  @ApiProperty({ enum: PayoutMethod })
  @IsEnum(PayoutMethod)
  method: PayoutMethod;

  @ApiProperty({ example: 'bKash Personal: 01712345678' })
  @IsString()
  @IsNotEmpty()
  accountDetails: string;
}
