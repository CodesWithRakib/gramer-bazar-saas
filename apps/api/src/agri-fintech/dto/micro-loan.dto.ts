import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MicroLoanPurpose,
  MicroLoanStatus,
} from '../entities/micro-loan-application.entity.js';

export class ApplyMicroLoanDto {
  @ApiProperty({ description: 'Requested loan amount in BDT', example: 50000 })
  @IsNumber()
  @Min(5000)
  @Max(500000)
  requestedAmount: number;

  @ApiProperty({
    enum: MicroLoanPurpose,
    example: MicroLoanPurpose.HIGH_YIELD_SEEDS,
  })
  @IsEnum(MicroLoanPurpose)
  purpose: MicroLoanPurpose;

  @ApiProperty({ description: 'Loan tenure in months (3, 6, 9, 12)', example: 6 })
  @IsNumber()
  @Min(3)
  @Max(24)
  tenureMonths: number;

  @ApiPropertyOptional({
    description: 'Partner Microfinance Institution preference',
    example: 'BRAC_MICROFINANCE',
  })
  @IsOptional()
  @IsString()
  partnerMfi?: string;
}

export class UpdateLoanStatusDto {
  @ApiProperty({ enum: MicroLoanStatus, example: MicroLoanStatus.APPROVED })
  @IsEnum(MicroLoanStatus)
  status: MicroLoanStatus;

  @ApiPropertyOptional({ description: 'Approved loan amount in BDT', example: 45000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  approvedAmount?: number;

  @ApiPropertyOptional({ description: 'Admin or MFI evaluation remarks' })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
