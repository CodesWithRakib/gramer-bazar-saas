import { IsEnum, IsISO8601, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RiderEarningStatus } from '../enums/rider-earning-status.enum.js';

export class QueryRiderEarningsDto {
  @ApiPropertyOptional({ enum: RiderEarningStatus })
  @IsOptional()
  @IsEnum(RiderEarningStatus)
  status?: RiderEarningStatus;

  @ApiPropertyOptional({ description: 'ISO date lower bound (inclusive)' })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO date upper bound (inclusive)' })
  @IsOptional()
  @IsISO8601()
  to?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
