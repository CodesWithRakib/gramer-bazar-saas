import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import {
  OilSeedType,
  OilExtractionMethod,
  GhaniWoodType,
  PressingBatchStatus,
  ArgemoneTestResult,
  AdulterationScreeningStatus,
  OilPurityGrade,
  OilPackagingType,
  OilRegion,
} from '../enums/edible-oil.enum.js';

export class CalculateOilExtractionDto {
  @IsEnum(OilSeedType)
  seedType: OilSeedType;

  @IsNumber()
  @Min(10)
  seedWeightKg: number;

  @IsEnum(OilExtractionMethod)
  extractionMethod: OilExtractionMethod;

  @IsNumber()
  @Min(4)
  @Max(15)
  @IsOptional()
  seedMoisturePct?: number;
}

export class EvaluateOilPurityDto {
  @IsEnum(OilSeedType)
  seedType: OilSeedType;

  @IsNumber()
  @Min(0)
  @Max(20)
  freeFattyAcidPct: number; // FFA <= 1.5%

  @IsNumber()
  @Min(0)
  @Max(100)
  peroxideValueMeq: number; // POV <= 10 meq/kg

  @IsNumber()
  @Min(0)
  @Max(2)
  allylIsothiocyanatePct: number; // >= 0.25%

  @IsEnum(ArgemoneTestResult)
  argemoneOilStatus: ArgemoneTestResult;

  @IsEnum(AdulterationScreeningStatus)
  adulterationStatus: AdulterationScreeningStatus;

  @IsNumber()
  @Min(20)
  @Max(130)
  maxExtractionTempCelsius: number;
}

export class CreateGhaniPressingBatchDto {
  @IsString()
  millName: string;

  @IsString()
  contactPhone: string;

  @IsEnum(OilRegion)
  region: OilRegion;

  @IsEnum(OilSeedType)
  seedType: OilSeedType;

  @IsString()
  seedVariety: string;

  @IsNumber()
  @Min(10)
  inputSeedWeightKg: number;

  @IsEnum(OilExtractionMethod)
  extractionMethod: OilExtractionMethod;

  @IsEnum(GhaniWoodType)
  ghaniWoodType: GhaniWoodType;

  @IsNumber()
  @Min(20)
  @Max(100)
  maxExtractionTempCelsius: number;

  @IsNumber()
  @Min(8)
  @Max(80)
  operatingRpm: number;

  @IsNumber()
  @Min(1)
  @Max(24)
  crushingHours: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateBatchExtractionDto {
  @IsNumber()
  @Min(20)
  @Max(120)
  maxExtractionTempCelsius: number;

  @IsNumber()
  @Min(0)
  extractedOilLiters: number;

  @IsNumber()
  @Min(0)
  oilcakeWeightKg: number;

  @IsEnum(PressingBatchStatus)
  @IsOptional()
  status?: PressingBatchStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateOilPurityLabTestDto {
  @IsString()
  @IsOptional()
  batchId?: string;

  @IsEnum(OilSeedType)
  seedType: OilSeedType;

  @IsString()
  sampleName: string;

  @IsString()
  testingLabName: string;

  @IsNumber()
  @Min(0)
  @Max(20)
  freeFattyAcidPct: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  peroxideValueMeq: number;

  @IsNumber()
  @Min(0)
  @Max(2)
  allylIsothiocyanatePct: number;

  @IsEnum(ArgemoneTestResult)
  argemoneOilStatus: ArgemoneTestResult;

  @IsEnum(AdulterationScreeningStatus)
  adulterationStatus: AdulterationScreeningStatus;

  @IsNumber()
  @Min(1.4)
  @Max(1.5)
  refractiveIndex: number;

  @IsString()
  leadChemistName: string;
}

export class CreateArtisanalOilLotDto {
  @IsString()
  @IsOptional()
  batchId?: string;

  @IsString()
  @IsOptional()
  labTestId?: string;

  @IsString()
  lotTitle: string;

  @IsString()
  millProducerName: string;

  @IsEnum(OilRegion)
  originRegion: OilRegion;

  @IsEnum(OilSeedType)
  seedType: OilSeedType;

  @IsEnum(OilPackagingType)
  packagingType: OilPackagingType;

  @IsNumber()
  @Min(5)
  totalVolumeLiters: number;

  @IsNumber()
  @Min(50)
  pricePerLiterBdt: number;

  @IsNumber()
  @Min(1)
  minimumOrderLiters: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  pungencyRating: number;

  @IsBoolean()
  @IsOptional()
  isBstiCertified?: boolean;

  @IsBoolean()
  @IsOptional()
  isColdPressedCertified?: boolean;
}

export class PurchaseOilLotDto {
  @IsString()
  buyerName: string;

  @IsString()
  buyerPhone: string;

  @IsNumber()
  @Min(1)
  orderQuantityLiters: number;
}
