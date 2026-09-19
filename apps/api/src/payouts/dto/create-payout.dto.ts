import { IsNumber, IsEnum, IsString, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PayoutMethod } from '../entities/payout-request.entity.js';

export class CreatePayoutDto {
  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(500, { message: 'Minimum payout amount is 500' })
  amount: number;

  @ApiProperty({ enum: PayoutMethod })
  @IsEnum(PayoutMethod)
  method: PayoutMethod;

  @ApiProperty({ example: 'Bank: DBBL, Acc: 123456789' })
  @IsString()
  @IsNotEmpty()
  accountDetails: string;
}
