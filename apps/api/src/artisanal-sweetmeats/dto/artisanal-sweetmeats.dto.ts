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
  SweetmeatType,
  SweetmeatRegion,
  MilkSourceType,
  ChhanaCoagulantType,
  StarchAdulterationTest,
  SweetmeatPackagingType,
} from '../enums/artisanal-sweetmeats.enum.js';

export class CalculateSweetmeatYieldDto {
  @IsEnum(SweetmeatType)
  sweetmeatType: SweetmeatType;

  @IsNumber()
  @Min(10)
  inputMilkVolumeLiters: number;

  @IsNumber()
  @Min(3.0)
  @Max(10.0)
  @IsOptional()
  milkFatPct?: number;

  @IsEnum(MilkSourceType)
  milkSource: MilkSourceType;
}

export class EvaluateSweetmeatPurityDto {
  @IsEnum(SweetmeatType)
  sweetmeatType: SweetmeatType;

  @IsNumber()
  @Min(0)
  @Max(60)
  milkFatDryMatterPct: number;

  @IsNumber()
  @Min(20)
  @Max(80)
  moisturePct: number;

  @IsEnum(StarchAdulterationTest)
  starchAdulterationStatus: StarchAdulterationTest;

  @IsBoolean()
  isDetergentOrUreaDetected: boolean;

  @IsBoolean()
  isHydrogenatedFatVanaspatiDetected: boolean;

  @IsBoolean()
  isArtificialColoringDetected: boolean;

  @IsNumber()
  @Min(60)
  @Max(120)
  coagulationTempCelsius: number;
}

export class CreateChhanaProductionBatchDto {
  @IsString()
  moiraGuildName: string;

  @IsString()
  contactPhone: string;

  @IsEnum(SweetmeatRegion)
  region: SweetmeatRegion;

  @IsEnum(SweetmeatType)
  sweetmeatType: SweetmeatType;

  @IsEnum(MilkSourceType)
  milkSource: MilkSourceType;

  @IsNumber()
  @Min(10)
  inputMilkVolumeLiters: number;

  @IsNumber()
  @Min(3.0)
  @Max(10.0)
  milkFatPct: number;

  @IsNumber()
  @Min(7.0)
  @Max(12.0)
  milkSnfPct: number;

  @IsEnum(ChhanaCoagulantType)
  coagulantType: ChhanaCoagulantType;

  @IsNumber()
  @Min(70)
  @Max(100)
  coagulationTempCelsius: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateBatchCookingDto {
  @IsNumber()
  @Min(1)
  producedChhanaKg: number;

  @IsNumber()
  @Min(30)
  @Max(70)
  chhanaMoisturePct: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateSweetmeatPurityLabTestDto {
  @IsString()
  @IsOptional()
  batchId?: string;

  @IsEnum(SweetmeatType)
  sweetmeatType: SweetmeatType;

  @IsString()
  sampleName: string;

  @IsString()
  testingLabName: string;

  @IsNumber()
  @Min(0)
  @Max(60)
  milkFatDryMatterPct: number;

  @IsNumber()
  @Min(20)
  @Max(80)
  moisturePct: number;

  @IsEnum(StarchAdulterationTest)
  starchAdulterationStatus: StarchAdulterationTest;

  @IsBoolean()
  isDetergentOrUreaDetected: boolean;

  @IsBoolean()
  isHydrogenatedFatVanaspatiDetected: boolean;

  @IsBoolean()
  isArtificialColoringDetected: boolean;

  @IsNumber()
  @Min(0)
  @Max(5)
  totalAcidityLacticPct: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  sensoryTasteScore: number;

  @IsString()
  leadChemistName: string;
}

export class CreateArtisanalSweetmeatLotDto {
  @IsString()
  @IsOptional()
  batchId?: string;

  @IsString()
  @IsOptional()
  labTestId?: string;

  @IsString()
  lotTitle: string;

  @IsString()
  moiraProducerName: string;

  @IsEnum(SweetmeatRegion)
  originRegion: SweetmeatRegion;

  @IsEnum(SweetmeatType)
  sweetmeatType: SweetmeatType;

  @IsEnum(SweetmeatPackagingType)
  packagingType: SweetmeatPackagingType;

  @IsNumber()
  @Min(1)
  totalWeightKg: number;

  @IsNumber()
  @Min(100)
  pricePerKgBdt: number;

  @IsNumber()
  @Min(1)
  minimumOrderKg: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  textureSoftnessRating: number;

  @IsBoolean()
  @IsOptional()
  isGiTagged?: boolean;

  @IsBoolean()
  @IsOptional()
  isRefrigeratedColdChain?: boolean;
}

export class PurchaseSweetmeatLotDto {
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
