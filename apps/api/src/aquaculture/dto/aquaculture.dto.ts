import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AquacultureCategory,
  SpeciesName,
  HatcheryStage,
  PCRTestStatus,
  LiveFishTransportStatus,
} from '../enums/aquaculture.enum.js';

export class CreateHatcheryBatchDto {
  @IsString()
  @IsNotEmpty()
  hatcheryName!: string;

  @IsString()
  @IsNotEmpty()
  hatcheryPhone!: string;

  @IsString()
  @IsNotEmpty()
  hatcheryDistrict!: string;

  @IsString()
  @IsNotEmpty()
  hatcheryUpazila!: string;

  @IsString()
  @IsNotEmpty()
  batchNumber!: string;

  @IsEnum(AquacultureCategory)
  category!: AquacultureCategory;

  @IsEnum(SpeciesName)
  species!: SpeciesName;

  @IsEnum(HatcheryStage)
  stage!: HatcheryStage;

  @IsOptional()
  @IsString()
  pcrTestReportNumber?: string;

  @IsOptional()
  @IsEnum(PCRTestStatus)
  pcrTestStatus?: PCRTestStatus;

  @IsOptional()
  @IsString()
  testingLab?: string;

  @IsNumber()
  @Type(() => Number)
  @Min(100)
  fingerlingCount!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0.1)
  averageLengthCm!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  unitPriceBdt!: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minOrderQuantity?: number;

  @IsOptional()
  @IsBoolean()
  oxygenPackingIncluded?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class QueryHatcheryBatchesDto {
  @IsOptional()
  @IsEnum(AquacultureCategory)
  category?: AquacultureCategory;

  @IsOptional()
  @IsEnum(SpeciesName)
  species?: SpeciesName;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsBoolean()
  spfOnly?: boolean;
}

export class UpdateHatcheryBatchDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fingerlingCount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  unitPriceBdt?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsEnum(PCRTestStatus)
  pcrTestStatus?: PCRTestStatus;
}

export class IngestPondTelemetryDto {
  @IsString()
  @IsNotEmpty()
  pondId!: string;

  @IsString()
  @IsNotEmpty()
  pondName!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(25)
  dissolvedOxygenMgL!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(5)
  @Max(45)
  waterTemperatureCelsius!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(3)
  @Max(12)
  waterPh!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  ammoniaNh3Ppm!: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  salinityPpt?: number;
}

export class RecordFeedFcrDto {
  @IsString()
  @IsNotEmpty()
  pondId!: string;

  @IsEnum(SpeciesName)
  species!: SpeciesName;

  @IsString()
  @IsNotEmpty()
  stockingDate!: string;

  @IsString()
  @IsNotEmpty()
  feedBrand!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  cumulativeFeedKg!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  estimatedBiomassKg!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  averageBodyWeightGrams!: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  survivalRatePercentage?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  recordedDate!: string;
}

export class BookLiveFishTankerDto {
  @IsString()
  @IsNotEmpty()
  farmerId!: string;

  @IsString()
  @IsNotEmpty()
  pickupDistrict!: string;

  @IsString()
  @IsNotEmpty()
  pickupUpazila!: string;

  @IsString()
  @IsNotEmpty()
  pickupGherAddress!: string;

  @IsString()
  @IsNotEmpty()
  dropoffMarket!: string;

  @IsEnum(SpeciesName)
  species!: SpeciesName;

  @IsNumber()
  @Type(() => Number)
  @Min(50)
  approximateFishKg!: number;

  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsNumber()
  @Type(() => Number)
  transportFareBdt!: number;

  @IsOptional()
  @IsString()
  departureTime?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTankerStatusDto {
  @IsEnum(LiveFishTransportStatus)
  status!: LiveFishTransportStatus;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsString()
  driverPhone?: string;

  @IsOptional()
  @IsString()
  vehiclePlateNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
