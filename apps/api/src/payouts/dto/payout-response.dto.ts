import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayoutMethod, PayoutStatus } from '../entities/payout-request.entity.js';

export class PayoutResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  sellerId: string;

  @ApiProperty({ example: 5000.0, description: 'Requested payout disbursement amount in BDT' })
  amount: number;

  @ApiProperty({ enum: PayoutMethod, example: PayoutMethod.BKASH })
  method: PayoutMethod;

  @ApiProperty({ example: 'bKash Personal: 01712345678' })
  accountDetails: string;

  @ApiProperty({ enum: PayoutStatus, example: PayoutStatus.PENDING })
  status: PayoutStatus;

  @ApiPropertyOptional({ example: 'Disbursed via TrxID 9A8B7C', nullable: true })
  adminNote?: string | null;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  updatedAt: string;
}
