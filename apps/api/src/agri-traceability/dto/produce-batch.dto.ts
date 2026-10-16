import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CropType,
  ProduceGrade,
  PesticideUsage,
  CheckpointStage,
} from '../enums/produce-traceability.enum.js';

export class CreateProduceBatchDto {
  @ApiProperty({ enum: CropType, example: CropType.POTATO })
  @IsEnum(CropType)
  cropType: CropType;

  @ApiProperty({ example: 'Diamond' })
  @IsString()
  @IsNotEmpty()
  variety: string;

  @ApiProperty({ example: '2026-10-15' })
  @IsString()
  @IsNotEmpty()
  harvestDate: string;

  @ApiProperty({ example: 'Purba Birganj Village, Ward 4' })
  @IsString()
  @IsNotEmpty()
  farmLocation: string;

  @ApiProperty({ example: 'Rangpur' })
  @IsString()
  @IsNotEmpty()
  division: string;

  @ApiProperty({ example: 'Dinajpur' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'Birganj' })
  @IsString()
  @IsNotEmpty()
  upazila: string;

  @ApiProperty({ example: 2500, description: 'Harvest yield in kilograms' })
  @IsNumber()
  @Min(1)
  harvestYieldKg: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  organicCertified?: boolean;

  @ApiPropertyOptional({
    enum: PesticideUsage,
    example: PesticideUsage.INTEGRATED_PEST_MANAGEMENT,
  })
  @IsOptional()
  @IsEnum(PesticideUsage)
  pesticideProfile?: PesticideUsage;

  @ApiPropertyOptional({ example: 'd08c5c16-83c7-4348-8df0-eecab7ef624c' })
  @IsOptional()
  @IsUUID()
  storageHubId?: string;

  @ApiPropertyOptional({ example: 92, description: 'Visual size and shape uniformity (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  uniformityScore?: number;

  @ApiPropertyOptional({ example: 88, description: 'Surface blemish freedom score (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  surfaceDefectScore?: number;

  @ApiPropertyOptional({ example: 95, description: 'Color maturity score (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  colorScore?: number;

  @ApiPropertyOptional({ example: 90, description: 'Produce firmness and moisture rating (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  moistureScore?: number;
}

export class AddCheckpointLogDto {
  @ApiProperty({ enum: CheckpointStage, example: CheckpointStage.COLD_STORAGE_DEPOSIT })
  @IsEnum(CheckpointStage)
  stage: CheckpointStage;

  @ApiProperty({ example: 'Dinajpur Central Cold Storage Facility' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'Md. Shahidul Islam (Hub Supervisor)' })
  @IsString()
  @IsNotEmpty()
  handlerName: string;

  @ApiPropertyOptional({ example: 4.5, description: 'Storage temperature in Celsius' })
  @IsOptional()
  @IsNumber()
  temperatureC?: number;

  @ApiPropertyOptional({ example: 85, description: 'Storage relative humidity percentage' })
  @IsOptional()
  @IsNumber()
  humidity?: number;

  @ApiPropertyOptional({ example: 'Stored in Chamber 2, Rack B-14 under controlled atmospheric conditions.' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReassessQualityDto {
  @ApiPropertyOptional({ example: 95 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  uniformityScore?: number;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  surfaceDefectScore?: number;

  @ApiPropertyOptional({ example: 92 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  colorScore?: number;

  @ApiPropertyOptional({ example: 88 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  moistureScore?: number;
}

export class QueryProduceBatchesDto {
  @ApiPropertyOptional({ enum: CropType })
  @IsOptional()
  @IsEnum(CropType)
  cropType?: CropType;

  @ApiPropertyOptional({ enum: ProduceGrade })
  @IsOptional()
  @IsEnum(ProduceGrade)
  qualityGrade?: ProduceGrade;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  limit?: number;
}
