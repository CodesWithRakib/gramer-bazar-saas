import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  HoneyFloralSource,
  HoneyHarvestType,
  BeeSpecies,
  ApiaryBoxHealthStatus,
  SuperfoodProductType,
} from '../enums/honey-apiary.enum.js';

export class CalculateHoneyPurityDto {
  @Type(() => Number)
  @IsNumber()
  @Min(10.0)
  @Max(30.0)
  moisturePercentage!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-35.0)
  @Max(-5.0)
  c4SugarIsotopeRatioPermil!: number; // e.g. -26.5‰ for pure C3 flower nectar; > -23.5‰ indicates C4 cane/corn syrup

  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  @Max(200.0)
  hmfFreshnessMgPerKg!: number; // Hydroxymethylfurfural (HMF)

  @IsOptional()
  @IsEnum(HoneyFloralSource)
  floralSource?: HoneyFloralSource;
}

export class CalculateApiaryMigrationYieldDto {
  @Type(() => Number)
  @IsNumber()
  @Min(2)
  @Max(1000)
  beeBoxesCount!: number;

  @IsEnum(HoneyFloralSource)
  floralSource!: HoneyFloralSource;

  @Type(() => Number)
  @IsNumber()
  @Min(5)
  @Max(90)
  daysInBloom!: number;
}

export class CreateHoneyHarvestLotDto {
  @IsString()
  beekeeperName!: string;

  @IsString()
  beekeeperPhone!: string;

  @IsString()
  district!: string;

  @IsEnum(HoneyHarvestType)
  harvestType!: HoneyHarvestType;

  @IsEnum(HoneyFloralSource)
  floralSource!: HoneyFloralSource;

  @IsEnum(BeeSpecies)
  beeSpecies!: BeeSpecies;

  @IsString()
  harvestDate!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  grossVolumeKg!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(10.0)
  @Max(30.0)
  moisturePercentage!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-35.0)
  @Max(-5.0)
  c4SugarIsotopeRatioPermil!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  @Max(200.0)
  hmfFreshnessMgPerKg!: number;

  @IsOptional()
  @IsString()
  labCertificateNo?: string;

  @IsOptional()
  @IsString()
  forestDeptPermitNo?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(100)
  wholesalePricePerKgBdt!: number;

  @IsOptional()
  @IsBoolean()
  isForestCertifiedWild?: boolean;
}

export class RegisterApiaryBoxDto {
  @IsString()
  boxCode!: string;

  @IsString()
  beekeeperName!: string;

  @IsEnum(BeeSpecies)
  beeSpecies!: BeeSpecies;

  @IsString()
  currentDistrict!: string;

  @IsString()
  currentUpazila!: string;

  @Type(() => Number)
  @IsNumber()
  gpsLatitude!: number;

  @Type(() => Number)
  @IsNumber()
  gpsLongitude!: number;

  @IsString()
  activeFloralCrop!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(4)
  @Max(12)
  framesCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  queenAgeMonths?: number;

  @IsOptional()
  @IsEnum(ApiaryBoxHealthStatus)
  healthStatus?: ApiaryBoxHealthStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estimatedHoneyYieldKg?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateApiaryBoxHealthDto {
  @IsEnum(ApiaryBoxHealthStatus)
  healthStatus!: ApiaryBoxHealthStatus;

  @IsOptional()
  @IsString()
  currentDistrict?: string;

  @IsOptional()
  @IsString()
  currentUpazila?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gpsLatitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gpsLongitude?: number;

  @IsOptional()
  @IsString()
  activeFloralCrop?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estimatedHoneyYieldKg?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateRoyalJellyBatchDto {
  @IsEnum(SuperfoodProductType)
  productType!: SuperfoodProductType;

  @IsString()
  producerName!: string;

  @IsString()
  harvestLocation!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(10)
  weightGrams!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  @Max(5.0)
  tenHdaPercentage!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  storageTemperatureCelsius?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(50)
  priceBdt!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  availableStockCount!: number;
}
