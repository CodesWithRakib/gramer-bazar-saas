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
  FruitType,
  OrchardRegion,
  FruitCultivar,
  FruitBaggingStatus,
  OrchardAuctionStatus,
  HwtTreatmentStatus,
  ChemicalMrlStatus,
  PackagingType,
  DispatchGradingQuality,
  ColdChainTransitStatus,
} from '../enums/orchard-auction.enum.js';

export class CalculateOrchardValuationDto {
  @IsEnum(FruitType)
  fruitType: FruitType;

  @IsEnum(FruitCultivar)
  cultivar: FruitCultivar;

  @IsNumber()
  @Min(1)
  treeCount: number;

  @IsNumber()
  @Min(5)
  averageYieldKgPerTree: number;

  @IsNumber()
  @Min(10)
  @Max(100)
  floweringFruitSetPct: number;

  @IsEnum(FruitBaggingStatus)
  fruitBaggingStatus: FruitBaggingStatus;

  @IsBoolean()
  @IsOptional()
  isGiCertified?: boolean;
}

export class EvaluateHwtQuarantineDto {
  @IsEnum(FruitType)
  fruitType: FruitType;

  @IsNumber()
  @Min(35)
  @Max(65)
  waterTempCelsius: number;

  @IsNumber()
  @Min(10)
  @Max(120)
  immersionDurationMinutes: number;

  @IsNumber()
  @Min(35)
  @Max(60)
  fruitCoreTempCelsius: number;

  @IsNumber()
  @Min(0)
  chemicalMrlPpm: number;

  @IsNumber()
  @Min(-10)
  @Max(45)
  transitTempCelsius: number;

  @IsNumber()
  @Min(20)
  @Max(100)
  transitHumidityPct: number;
}

export class CreateOrchardAuctionLotDto {
  @IsString()
  orchardName: string;

  @IsString()
  growerName: string;

  @IsString()
  growerPhone: string;

  @IsEnum(OrchardRegion)
  region: OrchardRegion;

  @IsString()
  @IsOptional()
  mouzaPlotNumber?: string;

  @IsEnum(FruitType)
  fruitType: FruitType;

  @IsEnum(FruitCultivar)
  cultivar: FruitCultivar;

  @IsBoolean()
  @IsOptional()
  isGiCertified?: boolean;

  @IsString()
  @IsOptional()
  giRegistrationNumber?: string;

  @IsNumber()
  @Min(1)
  totalTrees: number;

  @IsNumber()
  @Min(10)
  estimatedYieldKg: number;

  @IsNumber()
  @Min(1)
  treeAgeYears: number;

  @IsNumber()
  @Min(10)
  @Max(100)
  floweringFruitSetPct: number;

  @IsEnum(FruitBaggingStatus)
  fruitBaggingStatus: FruitBaggingStatus;

  @IsNumber()
  @IsOptional()
  baggedFruitsCount?: number;

  @IsNumber()
  @Min(1000)
  baseReservePriceBdt: number;

  @IsNumber()
  @IsOptional()
  advanceEscrowPct?: number;

  @IsString()
  @IsOptional()
  auctionClosingDate?: string;

  @IsString()
  @IsOptional()
  expectedHarvestStartDate?: string;
}

export class PlaceOrchardBidDto {
  @IsString()
  bidderName: string;

  @IsString()
  bidderPhone: string;

  @IsNumber()
  @Min(1000)
  bidAmountBdt: number;
}

export class CreatePhytosanitaryHwtBatchDto {
  @IsString()
  @IsOptional()
  orchardLotId?: string;

  @IsString()
  orchardName: string;

  @IsEnum(FruitType)
  fruitType: FruitType;

  @IsEnum(FruitCultivar)
  cultivar: FruitCultivar;

  @IsNumber()
  @Min(10)
  totalFreshWeightKg: number;

  @IsNumber()
  @Min(1)
  cratesCount: number;

  @IsString()
  hwtFacilityLocation: string;

  @IsNumber()
  waterTempCelsius: number;

  @IsNumber()
  immersionDurationMinutes: number;

  @IsNumber()
  fruitCoreTempCelsius: number;

  @IsNumber()
  hydrocoolingTempCelsius: number;

  @IsEnum(ChemicalMrlStatus)
  chemicalMrlStatus: ChemicalMrlStatus;

  @IsNumber()
  pesticideMrlPpm: number;

  @IsString()
  inspectorName: string;

  @IsString()
  inspectorDesignation: string;
}

export class CreateOrchardHarvestDispatchDto {
  @IsString()
  @IsOptional()
  orchardLotId?: string;

  @IsString()
  @IsOptional()
  hwtBatchId?: string;

  @IsEnum(FruitType)
  fruitType: FruitType;

  @IsEnum(FruitCultivar)
  cultivar: FruitCultivar;

  @IsNumber()
  @Min(10)
  dispatchWeightKg: number;

  @IsNumber()
  @Min(1)
  cratesCount: number;

  @IsEnum(PackagingType)
  packagingType: PackagingType;

  @IsNumber()
  @Min(5)
  @Max(30)
  brixSugarDegree: number;

  @IsEnum(DispatchGradingQuality)
  gradingQuality: DispatchGradingQuality;

  @IsString()
  reeferVanPlateNumber: string;

  @IsNumber()
  reeferSetpointCelsius: number;

  @IsNumber()
  currentTransitTempCelsius: number;

  @IsNumber()
  currentTransitHumidityPct: number;

  @IsString()
  originHub: string;

  @IsString()
  destinationMarket: string;
}

export class UpdateDispatchColdChainDto {
  @IsNumber()
  currentTransitTempCelsius: number;

  @IsNumber()
  currentTransitHumidityPct: number;

  @IsEnum(ColdChainTransitStatus)
  @IsOptional()
  coldChainStatus?: ColdChainTransitStatus;

  @IsString()
  @IsOptional()
  status?: string;
}
