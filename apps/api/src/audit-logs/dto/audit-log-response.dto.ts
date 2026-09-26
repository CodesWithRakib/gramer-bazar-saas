import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiPropertyOptional({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', nullable: true })
  actorId?: string | null;

  @ApiPropertyOptional({ example: 'Admin User', nullable: true })
  actorName?: string | null;

  @ApiProperty({ example: 'UPDATE_PRODUCT_PRICE' })
  action: string;

  @ApiPropertyOptional({ example: 'PRODUCT', nullable: true })
  targetType?: string | null;

  @ApiPropertyOptional({ example: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', nullable: true })
  targetId?: string | null;

  @ApiPropertyOptional({ example: 'Changed price from 120 to 110', nullable: true })
  details?: string | null;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;
}
