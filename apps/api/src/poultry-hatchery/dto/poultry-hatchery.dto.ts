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
  PoultryBreedType,
  HatcheryFlockStage,
  VaccinationStatus,
} from '../enums/poultry-hatchery.enum.js';

export class CalculateFlockFcrDto {
  @IsEnum(PoultryBreedType)
  breedType!: PoultryBreedType;

  @Type(() => Number)
  @IsNumber()
  @Min(50)
  @Max(100000)
  initialChickCount!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(10)
  @Max(100000)
  currentLiveCount!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(5)
  cumulativeFeedConsumedKg!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(30)
  @Max(5000)
  averageWeightGrams!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(120)
  ageInDays?: number;
}

export class EvaluateEggGradingDto {
  @Type(() => Number)
  @IsNumber()
  @Min(35.0)
  @Max(90.0)
  averageEggWeightGrams!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  totalEggsCount?: number;
}

export class CreatePoultryBatchDto {
  @IsString()
  hatcheryName!: string;

  @IsString()
  breederPhone!: string;

  @IsString()
  district!: string;

  @IsEnum(PoultryBreedType)
  breedType!: PoultryBreedType;

  @IsEnum(HatcheryFlockStage)
  flockStage!: HatcheryFlockStage;

  @IsString()
  hatchDate!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(50)
  chickCount!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(30)
  averageWeightGrams!: number;

  @IsEnum(VaccinationStatus)
  vaccinationStatus!: VaccinationStatus;

  @IsOptional()
  @IsString()
  dlsSurgeonCertificationNo?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(10)
  unitPriceBdt!: number;

  @IsOptional()
  @IsBoolean()
  isBiosecureCertified?: boolean;
}

export class RecordBrooderTelemetryDto {
  @IsString()
  shedCode!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(10.0)
  @Max(50.0)
  temperatureCelsius!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(10.0)
  @Max(100.0)
  relativeHumidityPercent!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.0)
  @Max(100.0)
  ammoniaPpm!: number;

  @IsOptional()
  @IsString()
  exhaustFanState?: string;

  @IsOptional()
  @IsString()
  brooderHeaterState?: string;

  @IsOptional()
  @IsString()
  flockBatchCode?: string;
}

export class CreateTableEggLotDto {
  @IsString()
  farmName!: string;

  @IsString()
  district!: string;

  @IsString()
  collectionDate!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(100)
  totalEggsCount!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(35.0)
  @Max(90.0)
  averageEggWeightGrams!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.0)
  @Max(10.0)
  crackedEggPercentage?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(500)
  pricePerHundredBdt!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  availableCasesCount!: number;
}
