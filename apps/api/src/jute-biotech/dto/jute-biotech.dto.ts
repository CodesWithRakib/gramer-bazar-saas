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
  JuteVariety,
  JuteFiberGrade,
  RettingMethod,
  RettingStatus,
  BaleType,
  PackagingActCategory,
  BalingEscrowStatus,
} from '../enums/jute-biotech.enum.js';

export class CalculateMoistureDeductionDto {
  @IsNumber()
  @Min(1)
  grossWeightKg!: number;

  @IsNumber()
  @Min(0)
  tareWeightKg!: number;

  @IsNumber()
  @Min(5)
  @Max(40)
  moisturePercentage!: number; // Standard is 14%

  @IsNumber()
  @Min(500)
  basePricePerMaund!: number; // BDT per 40 kg maund

  @IsOptional()
  @IsEnum(JuteVariety)
  variety?: JuteVariety;

  @IsOptional()
  @IsEnum(JuteFiberGrade)
  grade?: JuteFiberGrade;
}

export class EvaluateRettingPondDto {
  @IsNumber()
  @Min(10)
  @Max(45)
  waterTempCelsius!: number;

  @IsNumber()
  @Min(4)
  @Max(10)
  waterPh!: number;

  @IsNumber()
  @Min(0)
  @Max(15)
  dissolvedOxygenMgL!: number;

  @IsNumber()
  @Min(1)
  @Max(35)
  daysSteeping!: number;

  @IsEnum(RettingMethod)
  rettingMethod!: RettingMethod;
}

export class CreateRettingBatchDto {
  @IsString()
  batchCode!: string;

  @IsString()
  farmerName!: string;

  @IsString()
  farmerPhone!: string;

  @IsString()
  district!: string;

  @IsString()
  upazila!: string;

  @IsOptional()
  @IsString()
  waterSourceType?: string;

  @IsEnum(JuteVariety)
  variety!: JuteVariety;

  @IsEnum(RettingMethod)
  rettingMethod!: RettingMethod;

  @IsOptional()
  @IsBoolean()
  microbialInoculantUsed?: boolean;

  @IsOptional()
  @IsString()
  inoculantStrainCode?: string;

  @IsString()
  steepingDate!: string;

  @IsString()
  expectedHarvestDate!: string;

  @IsNumber()
  @Min(1)
  daysElapsed!: number;

  @IsNumber()
  waterTempCelsius!: number;

  @IsNumber()
  waterPh!: number;

  @IsNumber()
  dissolvedOxygenMgL!: number;

  @IsOptional()
  @IsEnum(RettingStatus)
  status?: RettingStatus;

  @IsNumber()
  @Min(1)
  targetFiberYieldMaunds!: number;

  @IsOptional()
  @IsString()
  bjriFieldOfficer?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateRettingTelemetryDto {
  @IsOptional()
  @IsNumber()
  waterTempCelsius?: number;

  @IsOptional()
  @IsNumber()
  waterPh?: number;

  @IsOptional()
  @IsNumber()
  dissolvedOxygenMgL?: number;

  @IsOptional()
  @IsNumber()
  daysElapsed?: number;

  @IsOptional()
  @IsEnum(RettingStatus)
  status?: RettingStatus;
}

export class CreateFiberLotDto {
  @IsString()
  lotNumber!: string;

  @IsString()
  farmerName!: string;

  @IsString()
  balingCenterName!: string;

  @IsString()
  district!: string;

  @IsEnum(JuteVariety)
  variety!: JuteVariety;

  @IsEnum(JuteFiberGrade)
  grade!: JuteFiberGrade;

  @IsEnum(BaleType)
  baleType!: BaleType;

  @IsNumber()
  @Min(1)
  baleCount!: number;

  @IsNumber()
  @Min(10)
  grossWeightKg!: number;

  @IsNumber()
  @Min(0)
  tareWeightKg!: number;

  @IsNumber()
  @Min(5)
  @Max(40)
  moisturePercentage!: number;

  @IsNumber()
  @Min(500)
  pricePerMaund!: number;

  @IsOptional()
  @IsNumber()
  tensileStrengthGPerTex?: number;

  @IsOptional()
  @IsString()
  lustreScore?: string;

  @IsOptional()
  @IsNumber()
  rootCutPercentage?: number;

  @IsOptional()
  @IsNumber()
  defectPercentage?: number;

  @IsOptional()
  @IsEnum(BalingEscrowStatus)
  escrowStatus?: BalingEscrowStatus;

  @IsOptional()
  @IsString()
  directorateLicenseNumber?: string;

  @IsOptional()
  @IsString()
  bjriGradeCertNumber?: string;

  @IsOptional()
  @IsBoolean()
  isOrganicCertified?: boolean;
}

export class CreateB2bContractDto {
  @IsString()
  contractCode!: string;

  @IsString()
  buyerMillName!: string;

  @IsOptional()
  @IsString()
  buyerRegNumber?: string;

  @IsString()
  sellerCooperativeName!: string;

  @IsEnum(PackagingActCategory)
  mandatoryPackagingCategory!: PackagingActCategory;

  @IsString()
  productDescription!: string;

  @IsNumber()
  @Min(1)
  quantityMetricTonsOrBales!: number;

  @IsNumber()
  @Min(1000)
  unitPriceBdt!: number;

  @IsString()
  deliveryDeadline!: string;

  @IsOptional()
  @IsString()
  destinationDepot?: string;

  @IsOptional()
  @IsBoolean()
  compliancePackagingAct2010?: boolean;

  @IsOptional()
  @IsNumber()
  escrowDepositPercentage?: number;
}
