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
  MushroomVariety,
  SpawnGenerationStage,
  MushroomProductForm,
  SubstrateSterilizationStatus,
} from '../enums/mushroom-farming.enum.js';

export class CalculateDehydrationYieldDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100000)
  freshWeightKg!: number;

  @IsEnum(MushroomVariety)
  variety!: MushroomVariety;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(3.0)
  @Max(15.0)
  targetMoisturePercentage?: number;
}

export class CalculateChamberClimateDto {
  @Type(() => Number)
  @IsNumber()
  @Min(10.0)
  @Max(45.0)
  temperatureCelsius!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(30.0)
  @Max(100.0)
  relativeHumidityPercent!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(300.0)
  @Max(5000.0)
  co2Ppm!: number;
}

export class CreateSpawnBatchDto {
  @IsString()
  labName!: string;

  @IsString()
  growerPhone!: string;

  @IsString()
  district!: string;

  @IsEnum(MushroomVariety)
  variety!: MushroomVariety;

  @IsEnum(SpawnGenerationStage)
  generationStage!: SpawnGenerationStage;

  @IsString()
  inoculationDate!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(10)
  packetsCount!: number;

  @IsEnum(SubstrateSterilizationStatus)
  sterilizationMethod!: SubstrateSterilizationStatus;

  @Type(() => Number)
  @IsNumber()
  @Min(100.0)
  @Max(140.0)
  autoclaveTempCelsius!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(10.0)
  @Max(30.0)
  autoclavePressurePsi!: number;

  @IsOptional()
  @IsString()
  nmdiLabCertificationNo?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(10)
  pricePerPacketBdt!: number;

  @IsOptional()
  @IsBoolean()
  isContaminationFreeCertified?: boolean;
}

export class RecordChamberTelemetryDto {
  @IsString()
  chamberCode!: string;

  @IsOptional()
  @IsString()
  activeBatchNumber?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(10.0)
  @Max(45.0)
  temperatureCelsius!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(30.0)
  @Max(100.0)
  relativeHumidityPercent!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(300.0)
  @Max(5000.0)
  co2Ppm!: number;

  @IsOptional()
  @IsString()
  foggerMistState?: string;

  @IsOptional()
  @IsString()
  freshAirDamperState?: string;
}

export class CreateDehydratedLotDto {
  @IsString()
  processorName!: string;

  @IsString()
  district!: string;

  @IsEnum(MushroomVariety)
  variety!: MushroomVariety;

  @IsEnum(MushroomProductForm)
  productForm!: MushroomProductForm;

  @IsString()
  processingDate!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  freshWeightKg!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  dryWeightKg!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(3.0)
  @Max(15.0)
  moisturePercentage!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  polysaccharideBetaGlucanPercent?: number;

  @IsOptional()
  @IsBoolean()
  isHermeticNitrogenSealed?: boolean;

  @Type(() => Number)
  @IsNumber()
  @Min(50)
  pricePerKgBdt!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  availableStockKg!: number;
}
