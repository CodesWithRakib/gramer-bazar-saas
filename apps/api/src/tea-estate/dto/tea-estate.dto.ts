import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import {
  TeaGardenRegion,
  TeaProcessingType,
  TeaLeafGrade,
  AuctionCenter,
  AuctionLotStatus,
  PluckingStandard,
} from '../enums/tea-estate.enum.js';

export class CalculateGreenLeafIntakeDto {
  @IsNumber()
  @Min(1)
  grossWeightKg!: number;

  @IsNumber()
  @Min(0)
  tareBagWeightKg!: number;

  @IsNumber()
  @Min(10)
  @Max(100)
  finePluckingPercentage!: number; // Percentage of "two leaves and a bud"

  @IsNumber()
  @Min(0)
  surfaceWaterDeductionKg!: number; // Wet leaf rain/dew surface water deduction

  @IsNumber()
  @Min(10)
  ratePerKgBdt!: number; // Benchmark price per kg green leaf
}

export class EvaluateLiquorQualityDto {
  @IsNumber()
  @Min(1)
  @Max(10)
  brightnessScore!: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  brisknessScore!: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  liquorBodyScore!: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  colorScore!: number;

  @IsEnum(TeaProcessingType)
  processingType!: TeaProcessingType;

  @IsEnum(TeaLeafGrade)
  grade!: TeaLeafGrade;
}

export class CreateGreenLeafIntakeDto {
  @IsString()
  intakeTicketNumber!: string;

  @IsString()
  smallholderFarmerName!: string;

  @IsString()
  farmerPhone!: string;

  @IsOptional()
  @IsString()
  farmerRegNumber?: string;

  @IsString()
  gardenNameOrCluster!: string;

  @IsEnum(TeaGardenRegion)
  region!: TeaGardenRegion;

  @IsString()
  pluckingDate!: string;

  @IsNumber()
  @Min(1)
  grossWeightKg!: number;

  @IsNumber()
  @Min(0)
  tareBagWeightKg!: number;

  @IsNumber()
  @Min(10)
  @Max(100)
  finePluckingPercentage!: number;

  @IsNumber()
  @Min(0)
  surfaceWaterMoistureDeductionKg!: number;

  @IsNumber()
  @Min(10)
  ratePerKgBdt!: number;

  @IsOptional()
  @IsString()
  btbInspectorName?: string;
}

export class CreateFactoryBatchDto {
  @IsString()
  batchNumber!: string;

  @IsString()
  factoryName!: string;

  @IsEnum(TeaGardenRegion)
  region!: TeaGardenRegion;

  @IsEnum(TeaProcessingType)
  processingType!: TeaProcessingType;

  @IsNumber()
  @Min(10)
  greenLeafIntakeKg!: number;

  @IsNumber()
  @Min(1)
  witheringTroughHours!: number;

  @IsNumber()
  @Min(0)
  witheringMoistureLossPercentage!: number;

  @IsNumber()
  @Min(15)
  @Max(45)
  rollingFrictionTempCelsius!: number;

  @IsNumber()
  @Min(10)
  fermentationTimeMinutes!: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  dryerDischargeMoisturePercentage!: number;

  @IsNumber()
  @Min(1)
  finishedTeaYieldKg!: number;

  @IsEnum(TeaLeafGrade)
  primaryGrade!: TeaLeafGrade;

  @IsOptional()
  @IsString()
  certificationMark?: string;

  @IsOptional()
  @IsBoolean()
  isOrganicCertified?: boolean;
}

export class CreateAuctionLotDto {
  @IsString()
  lotNumber!: string;

  @IsString()
  gardenMark!: string;

  @IsEnum(AuctionCenter)
  auctionCenter!: AuctionCenter;

  @IsNumber()
  @Min(1)
  saleNumber!: number;

  @IsEnum(TeaProcessingType)
  processingType!: TeaProcessingType;

  @IsEnum(TeaLeafGrade)
  grade!: TeaLeafGrade;

  @IsNumber()
  @Min(1)
  packageCountBagsOrChests!: number;

  @IsNumber()
  @Min(10)
  netWeightKg!: number;

  @IsNumber()
  @Min(50)
  reservePricePerKgBdt!: number;

  @IsOptional()
  @IsNumber()
  tasterScoreBrightness?: number;

  @IsOptional()
  @IsNumber()
  tasterScoreBriskness?: number;

  @IsOptional()
  @IsNumber()
  tasterScoreLiquorBody?: number;

  @IsOptional()
  @IsString()
  tasterFlavorNotes?: string;

  @IsOptional()
  @IsBoolean()
  isOrganicCertified?: boolean;
}

export class PlaceAuctionBidDto {
  @IsString()
  brokerName!: string;

  @IsNumber()
  @Min(50)
  bidPerKgBdt!: number;
}
