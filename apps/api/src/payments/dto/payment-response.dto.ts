import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentProvider } from '../enums/payment-status.enum.js';
import { OrderResponseDto } from '../../orders/dto/order-response.dto.js';

export class InitiatePaymentResponseDto {
  @ApiProperty({ example: 'https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q=...' })
  paymentUrl: string;

  @ApiProperty({ example: 'TXN-GB-1727337600000-A1B2C' })
  transactionId: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  paymentId: string;
}

export class PaymentResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  orderId: string;

  @ApiProperty({ example: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f' })
  userId: string;

  @ApiProperty({ example: PaymentProvider.SSLCOMMERZ })
  provider: string;

  @ApiProperty({ example: 'TXN-GB-1727337600000-A1B2C' })
  transactionId: string;

  @ApiProperty({ example: 450.0 })
  amount: number;

  @ApiProperty({ example: 'BDT' })
  currency: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID })
  status: PaymentStatus;

  @ApiPropertyOptional({ example: 'VALID', nullable: true })
  gatewayStatus?: string | null;

  @ApiPropertyOptional({ example: 'VAL12345678', nullable: true })
  validationId?: string | null;

  @ApiPropertyOptional({ example: 'BANK-TXN-987654', nullable: true })
  bankTransactionId?: string | null;

  @ApiPropertyOptional({ example: 'BKASH-BKash', nullable: true })
  cardType?: string | null;

  @ApiPropertyOptional({ example: 'MOBILEBANKING', nullable: true })
  cardBrand?: string | null;

  @ApiPropertyOptional({ example: 'bKash', nullable: true })
  cardIssuer?: string | null;

  @ApiPropertyOptional({ example: '2026-09-26T10:05:00.000Z', nullable: true })
  paidAt?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  failedAt?: string | null;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-26T10:05:00.000Z' })
  updatedAt: string;

  @ApiPropertyOptional({ type: () => OrderResponseDto })
  order?: OrderResponseDto;
}
