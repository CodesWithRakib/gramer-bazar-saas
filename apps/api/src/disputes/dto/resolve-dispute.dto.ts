import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeStatus } from '../enums/dispute-status.enum.js';

export class ResolveDisputeDto {
  @ApiProperty({ enum: DisputeStatus, example: DisputeStatus.RESOLVED_REFUNDED })
  @IsEnum(DisputeStatus)
  @IsNotEmpty()
  status: DisputeStatus;

  @ApiPropertyOptional({ example: 'Partial refund approved for customer' })
  @IsString()
  @IsOptional()
  adminDecision?: string;
}
