import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { BatchStatus } from '../enums/medicine-batch-status.enum.js';

export class CreateMedicineBatchDto {
  @ApiProperty({ description: 'Product variant UUID' })
  @IsUUID()
  productVariantId: string;

  @ApiProperty({ example: 'BATCH-2026-001' })
  @IsString()
  batchNumber: string;

  @ApiPropertyOptional({ example: '2026-01-15' })
  @IsOptional()
  @IsDateString()
  manufacturingDate?: string;

  @ApiProperty({ example: '2027-06-30' })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({ example: 100, minimum: 0 })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ example: 'Square Distribution Ltd.' })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional({ example: 45.5, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchaseCost?: number;

  @ApiPropertyOptional({ enum: BatchStatus, default: BatchStatus.ACTIVE })
  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;
}

export class UpdateMedicineBatchDto extends PartialType(CreateMedicineBatchDto) {
  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  reservedQuantity?: number;
}

export class MedicineBatchResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e' })
  productVariantId: string;

  @ApiProperty({ example: 'BATCH-2026-001' })
  batchNumber: string;

  @ApiPropertyOptional({ example: '2026-01-15', nullable: true })
  manufacturingDate: string | null;

  @ApiProperty({ example: '2027-06-30' })
  expiryDate: string;

  @ApiProperty({ example: 100 })
  quantity: number;

  @ApiProperty({ example: 0 })
  reservedQuantity: number;

  @ApiPropertyOptional({ example: 'Square Distribution Ltd.', nullable: true })
  supplier: string | null;

  @ApiPropertyOptional({ example: 45.5, nullable: true })
  purchaseCost: number | null;

  @ApiProperty({ enum: BatchStatus, example: BatchStatus.ACTIVE })
  status: BatchStatus;

  @ApiProperty({ example: '2026-10-03T09:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-03T09:00:00.000Z' })
  updatedAt: Date;
}
