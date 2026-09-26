import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeReason } from '../enums/dispute-reason.enum.js';
import { DisputeStatus } from '../enums/dispute-status.enum.js';

export class DisputeMessageResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  disputeId: string;

  @ApiProperty({ example: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f' })
  senderId: string;

  @ApiProperty({ example: 'CUSTOMER', description: 'Sender role (CUSTOMER, SELLER, ADMIN)' })
  senderRole: string;

  @ApiProperty({ example: 'The items delivered were damaged during transit.' })
  message: string;

  @ApiPropertyOptional({ example: 'https://storage.gramerbazar.com/evidence/123.jpg', nullable: true })
  attachment?: string | null;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;
}

export class DisputeResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  orderId: string;

  @ApiProperty({ example: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f' })
  customerId: string;

  @ApiProperty({ example: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a' })
  sellerId: string;

  @ApiProperty({ enum: DisputeReason, example: DisputeReason.DAMAGED })
  reason: DisputeReason;

  @ApiProperty({ example: 'The packaging was torn and 2 mangoes were rotten.' })
  description: string;

  @ApiPropertyOptional({ example: ['https://images.unsplash.com/evidence.jpg'], nullable: true })
  evidenceImages?: string[] | null;

  @ApiProperty({ enum: DisputeStatus, example: DisputeStatus.OPEN })
  status: DisputeStatus;

  @ApiPropertyOptional({ example: 'Refund of 120 BDT issued to customer wallet', nullable: true })
  adminDecision?: string | null;

  @ApiPropertyOptional({ type: [DisputeMessageResponseDto] })
  messages?: DisputeMessageResponseDto[];

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  updatedAt: string;
}
