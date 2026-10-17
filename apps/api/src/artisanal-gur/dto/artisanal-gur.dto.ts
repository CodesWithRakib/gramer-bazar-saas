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
  GurType,
  GurRegion,
  SapCollectionShift,
  BoilingPanType,
  HydrosulfiteTestResult,
  SugarSyrupAdulterationStatus,
  GurPackagingType,
} from '../enums/artisanal-gur.enum.js';

export class CalculateGurExtractionDto {
  @IsEnum(GurType)
  gurType: GurType;

  @IsNumber()
  @Min(5)
  rawSapVolumeLiters: number;

  @IsNumber()
  @Min(5)
  @Max(25)
  @IsOptional()
  sapBrixDegrees?: number;

  @IsEnum(SapCollectionShift)
  sapCollectionShift: SapCollectionShift;
}

export class EvaluateGurPurityDto {
  @IsEnum(GurType)
  gurType: GurType;

  @IsNumber()
  @Min(0)
  @Max(100)
  sucrosePct: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  reducingSugarPct: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  hydrosulfitePpm: number;

  @IsEnum(HydrosulfiteTestResult)
  hydrosulfiteStatus: HydrosulfiteTestResult;

  @IsEnum(SugarSyrupAdulterationStatus)
  sugarAdulterationStatus: SugarSyrupAdulterationStatus;

  @IsBoolean()
  isArtificialColoringDetected: boolean;

  @IsNumber()
  @Min(80)
  @Max(150)
  strikeBoilingTempCelsius: number;
}

export class CreateDatePalmTappingBatchDto {
  @IsString()
  gachhiCoopName: string;

  @IsString()
  contactPhone: string;

  @IsEnum(GurRegion)
  region: GurRegion;

  @IsEnum(GurType)
  gurType: GurType;

  @IsEnum(SapCollectionShift)
  sapCollectionShift: SapCollectionShift;

  @IsNumber()
  @Min(1)
  treesTappedCount: number;

  @IsNumber()
  @Min(5)
  rawSapVolumeLiters: number;

  @IsNumber()
  @Min(5)
  @Max(25)
  sapBrixDegrees: number;

  @IsNumber()
  @Min(90)
  @Max(140)
  strikeBoilingTempCelsius: number;

  @IsEnum(BoilingPanType)
  panType: BoilingPanType;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateBatchBoilingDto {
  @IsNumber()
  @Min(90)
  @Max(140)
  strikeBoilingTempCelsius: number;

  @IsNumber()
  @Min(0)
  producedGurWeightKg: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateGurPurityLabTestDto {
  @IsString()
  @IsOptional()
  batchId?: string;

  @IsEnum(GurType)
  gurType: GurType;

  @IsString()
  sampleName: string;

  @IsString()
  testingLabName: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  sucrosePct: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  reducingSugarPct: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  hydrosulfitePpm: number;

  @IsEnum(HydrosulfiteTestResult)
  hydrosulfiteStatus: HydrosulfiteTestResult;

  @IsEnum(SugarSyrupAdulterationStatus)
  sugarAdulterationStatus: SugarSyrupAdulterationStatus;

  @IsBoolean()
  isArtificialColoringDetected: boolean;

  @IsNumber()
  @Min(0)
  @Max(10)
  leadPpm: number;

  @IsNumber()
  @Min(50)
  @Max(95)
  totalSolubleSolidsBrix: number;

  @IsString()
  leadChemistName: string;
}

export class CreateArtisanalGurLotDto {
  @IsString()
  @IsOptional()
  batchId?: string;

  @IsString()
  @IsOptional()
  labTestId?: string;

  @IsString()
  lotTitle: string;

  @IsString()
  artisanProducerName: string;

  @IsEnum(GurRegion)
  originRegion: GurRegion;

  @IsEnum(GurType)
  gurType: GurType;

  @IsEnum(GurPackagingType)
  packagingType: GurPackagingType;

  @IsNumber()
  @Min(5)
  totalWeightKg: number;

  @IsNumber()
  @Min(50)
  pricePerKgBdt: number;

  @IsNumber()
  @Min(1)
  minimumOrderKg: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  aromaRating: number;

  @IsBoolean()
  @IsOptional()
  isGiTagged?: boolean;

  @IsBoolean()
  @IsOptional()
  isHydrosulfiteFreeCertified?: boolean;
}

export class PurchaseGurLotDto {
  @IsString()
  buyerName: string;

  @IsString()
  buyerPhone: string;

  @IsNumber()
  @Min(1)
  orderQuantityKg: number;

  @IsString()
  @IsOptional()
  deliveryAddress?: string;
}
