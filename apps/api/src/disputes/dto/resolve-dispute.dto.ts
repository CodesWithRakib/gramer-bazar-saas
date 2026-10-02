import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeResolutionType } from '../enums/dispute-resolution-type.enum.js';

export class ResolveDisputeDto {
  @ApiProperty({ enum: DisputeResolutionType, example: DisputeResolutionType.FULL_REFUND })
  @IsEnum(DisputeResolutionType)
  @IsNotEmpty()
  resolutionType: DisputeResolutionType;

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
