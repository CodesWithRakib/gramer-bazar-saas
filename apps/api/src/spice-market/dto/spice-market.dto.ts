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
  SpiceType,
  SpiceRegion,
  DryingMethod,
  DryingBatchStatus,
  AflatoxinRiskLevel,
  AdulterationTestStatus,
  SpicePurityGrade,
  SpiceFormFactor,
  SpicePackagingType,
  SpiceLotStatus,
} from '../enums/spice-market.enum.js';

export class CalculateSpiceDehydrationDto {
  @IsEnum(SpiceType)
  spiceType: SpiceType;

  @IsNumber()
  @Min(10)
  freshWeightKg: number;

  @IsNumber()
  @Min(50)
  @Max(90)
  initialMoisturePct: number;

  @IsNumber()
  @Min(5)
  @Max(15)
  targetMoisturePct: number;

  @IsEnum(DryingMethod)
  dryingMethod: DryingMethod;
}

export class EvaluateSpicePurityDto {
  @IsEnum(SpiceType)
  spiceType: SpiceType;

  @IsEnum(AdulterationTestStatus)
  sudanDyeStatus: AdulterationTestStatus;

  @IsEnum(AdulterationTestStatus)
  leadChromateStatus: AdulterationTestStatus;

  @IsEnum(AdulterationTestStatus)
  metanilYellowStatus: AdulterationTestStatus;

  @IsNumber()
  @Min(0)
  @Max(30)
  moisturePct: number;

  @IsNumber()
  @Min(0)
  aflatoxinB1Ppb: number;

  @IsNumber()
  @IsOptional()
  curcuminPct?: number;

  @IsNumber()
  @IsOptional()
  scovilleHeatUnits?: number;

  @IsNumber()
  @IsOptional()
  essentialOilPct?: number;
}

export class CreateSpiceDryingBatchDto {
  @IsString()
  growerCoopName: string;

  @IsString()
  contactPhone: string;

  @IsEnum(SpiceRegion)
  region: SpiceRegion;

  @IsEnum(SpiceType)
  spiceType: SpiceType;

  @IsString()
  varietyName: string;

  @IsNumber()
  @Min(10)
  initialFreshWeightKg: number;

  @IsEnum(DryingMethod)
  dryingMethod: DryingMethod;

  @IsNumber()
  @Min(20)
  @Max(70)
  chamberTempCelsius: number;

  @IsNumber()
  @Min(10)
  @Max(90)
  chamberHumidityPct: number;

  @IsNumber()
  @Min(5)
  @Max(85)
  currentMoisturePct: number;
}

export class UpdateBatchTelemetryDto {
  @IsNumber()
  @Min(20)
  @Max(70)
  chamberTempCelsius: number;

  @IsNumber()
  @Min(10)
  @Max(90)
  chamberHumidityPct: number;

  @IsNumber()
  @Min(5)
  @Max(85)
  currentMoisturePct: number;

  @IsNumber()
  @Min(0)
  dryingDaysElapsed: number;

  @IsEnum(AflatoxinRiskLevel)
  @IsOptional()
  aflatoxinRiskLevel?: AflatoxinRiskLevel;

  @IsEnum(DryingBatchStatus)
  @IsOptional()
  status?: DryingBatchStatus;
}

export class CreateSpicePurityLabTestDto {
  @IsString()
  @IsOptional()
  batchId?: string;

  @IsEnum(SpiceType)
  spiceType: SpiceType;

  @IsString()
  sampleName: string;

  @IsString()
  testingLabName: string;

  @IsEnum(AdulterationTestStatus)
  sudanDyeStatus: AdulterationTestStatus;

  @IsEnum(AdulterationTestStatus)
  leadChromateStatus: AdulterationTestStatus;

  @IsEnum(AdulterationTestStatus)
  metanilYellowStatus: AdulterationTestStatus;

  @IsNumber()
  @Min(0)
  @Max(30)
  moisturePct: number;

  @IsNumber()
  @Min(0)
  aflatoxinB1Ppb: number;

  @IsNumber()
  @IsOptional()
  curcuminPct?: number;

  @IsNumber()
  @IsOptional()
  scovilleHeatUnits?: number;

  @IsNumber()
  @IsOptional()
  essentialOilPct?: number;

  @IsString()
  leadChemistName: string;
}

export class CreateSpiceForwardLotDto {
  @IsString()
  @IsOptional()
  dryingBatchId?: string;

  @IsString()
  @IsOptional()
  labTestId?: string;

  @IsString()
  lotTitle: string;

  @IsString()
  producerName: string;

  @IsEnum(SpiceRegion)
  originRegion: SpiceRegion;

  @IsEnum(SpiceType)
  spiceType: SpiceType;

  @IsEnum(SpiceFormFactor)
  formFactor: SpiceFormFactor;

  @IsNumber()
  @Min(10)
  totalQuantityKg: number;

  @IsEnum(SpicePackagingType)
  packagingType: SpicePackagingType;

  @IsNumber()
  @Min(10)
  pricePerKgBdt: number;

  @IsNumber()
  @Min(1)
  minimumOrderKg: number;

  @IsBoolean()
  @IsOptional()
  isBstiCertified?: boolean;

  @IsBoolean()
  @IsOptional()
  isBarisrcVerified?: boolean;
}

export class PurchaseSpiceLotDto {
  @IsString()
  buyerName: string;

  @IsString()
  buyerPhone: string;

  @IsNumber()
  @Min(1)
  orderQuantityKg: number;
}
