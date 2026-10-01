import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResolveDisputeDto {
  @ApiProperty({ enum: ['FULL_REFUND', 'PARTIAL_REFUND', 'REPLACEMENT', 'NO_REFUND'], example: 'FULL_REFUND' })
  @IsEnum(['FULL_REFUND', 'PARTIAL_REFUND', 'REPLACEMENT', 'NO_REFUND'])
  @IsNotEmpty()
  resolutionType: string;

  @ApiPropertyOptional({ example: 450.00 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  refundAmount?: number;

  @ApiPropertyOptional({ example: 'Partial refund approved for customer' })
  @IsString()
  @IsOptional()
  adminDecision?: string;

  @ApiPropertyOptional({ example: 'Customer showed clear evidence' })
  @IsString()
  @IsOptional()
  internalNote?: string;
}
