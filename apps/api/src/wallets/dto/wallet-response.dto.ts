import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../entities/wallet-transaction.entity.js';

export class WalletTransactionResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  walletId: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.CREDIT })
  type: TransactionType;

  @ApiProperty({ example: 450.0 })
  amount: number;

  @ApiProperty({ example: 'Order earnings for #ORD-12345' })
  description: string;

  @ApiPropertyOptional({ example: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', nullable: true })
  referenceId?: string | null;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;
}

export class WalletResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  userId: string;

  @ApiProperty({ example: 12500.5, description: 'Available liquid balance in BDT' })
  balance: number;

  @ApiProperty({ example: 3200.0, description: 'Funds from recent orders awaiting delivery clearance' })
  pendingClearance: number;

  @ApiProperty({ example: 85000.0, description: 'Lifetime gross earnings in BDT' })
  totalEarned: number;

  @ApiProperty({ example: 69300.0, description: 'Lifetime disbursed payouts in BDT' })
  totalWithdrawn: number;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  updatedAt: string;
}
