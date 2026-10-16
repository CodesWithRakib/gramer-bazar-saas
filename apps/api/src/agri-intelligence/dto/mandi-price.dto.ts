import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MandiTrendDirection } from '../entities/mandi-price.entity.js';

export class CreateMandiPriceDto {
  @ApiProperty({ description: 'Crop/commodity English name', example: 'Miniket Rice' })
  @IsString()
  cropName: string;

  @ApiProperty({ description: 'Crop/commodity Bengali name', example: 'মিনিকেট চাল' })
  @IsString()
  cropNameBn: string;

  @ApiProperty({ description: 'Commodity category/group', example: 'CEREALS' })
  @IsString()
  commodityGroup: string;

  @ApiProperty({ description: 'Division', example: 'Rajshahi' })
  @IsString()
  division: string;

  @ApiProperty({ description: 'District', example: 'Bogra' })
  @IsString()
  district: string;

  @ApiProperty({ description: 'Wholesale mandi/bazar name', example: 'Bogra Mohasthangarh Hat' })
  @IsString()
  marketName: string;

  @ApiProperty({ description: 'Minimum wholesale rate', example: 68.0 })
  @IsNumber()
  @Min(0)
  minPrice: number;

  @ApiProperty({ description: 'Maximum wholesale rate', example: 74.0 })
  @IsNumber()
  @Min(0)
  maxPrice: number;

  @ApiProperty({ description: 'Modal (prevailing average) rate', example: 70.0 })
  @IsNumber()
  @Min(0)
  modalPrice: number;

  @ApiPropertyOptional({ description: 'Unit of price (kg, maund, sack)', default: 'kg' })
  @IsOptional()
  @IsString()
  priceUnit?: string;

  @ApiPropertyOptional({ enum: MandiTrendDirection, default: MandiTrendDirection.STABLE })
  @IsOptional()
  @IsEnum(MandiTrendDirection)
  trendDirection?: MandiTrendDirection;

  @ApiProperty({ description: 'Observation date in YYYY-MM-DD', example: '2026-10-16' })
  @IsDateString()
  recordedDate: string;
}

export class MandiPriceFilterDto {
  @ApiPropertyOptional({ description: 'Filter by crop name or keyword' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by commodity group' })
  @IsOptional()
  @IsString()
  commodityGroup?: string;

  @ApiPropertyOptional({ description: 'Filter by division' })
  @IsOptional()
  @IsString()
  division?: string;

  @ApiPropertyOptional({ description: 'Filter by district' })
  @IsOptional()
  @IsString()
  district?: string;
}

export class FairPriceAdvisoryQueryDto {
  @ApiProperty({ description: 'Target crop name', example: 'Miniket Rice' })
  @IsString()
  cropName: string;

  @ApiPropertyOptional({ description: 'Target district or region', example: 'Bogra' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({ description: 'Offered seller unit price in BDT', example: 72.0 })
  @IsNumber()
  @Min(0)
  offeredPrice: number;
}
