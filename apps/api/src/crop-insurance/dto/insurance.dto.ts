import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsArray,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CropType,
  AgriSeason,
  ParametricTriggerType,
  PolicyStatus,
  ClaimDisasterSeverity,
  ClaimPayoutMethod,
} from '../enums/insurance.enum.js';

export class CreateCropInsurancePolicyDto {
  @IsString()
  @IsNotEmpty()
  policyCode: string;

  @IsString()
  @IsNotEmpty()
  titleEn: string;

  @IsString()
  @IsNotEmpty()
  titleBn: string;

  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @IsString()
  @IsOptional()
  descriptionBn?: string;

  @IsEnum(CropType)
  cropType: CropType;

  @IsEnum(AgriSeason)
  season: AgriSeason;

  @IsString()
  @IsNotEmpty()
  targetDistrict: string;

  @IsString()
  @IsOptional()
  targetUpazila?: string;

  @IsNumber()
  @Min(1)
  sumInsuredPerBigha: number;

  @IsNumber()
  @Min(1)
  premiumPerBigha: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  governmentSubsidyPct?: number;

  @IsEnum(ParametricTriggerType)
  triggerType: ParametricTriggerType;

  @IsNumber()
  triggerThresholdValue: number;

  @IsString()
  @IsNotEmpty()
  triggerThresholdUnit: string;

  @IsDateString()
  coverageStartDate: string;

  @IsDateString()
  coverageEndDate: string;
}

export class UpdateCropInsurancePolicyDto {
  @IsString()
  @IsOptional()
  titleEn?: string;

  @IsString()
  @IsOptional()
  titleBn?: string;

  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @IsString()
  @IsOptional()
  descriptionBn?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  sumInsuredPerBigha?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  premiumPerBigha?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  governmentSubsidyPct?: number;

  @IsNumber()
  @IsOptional()
  triggerThresholdValue?: number;

  @IsEnum(PolicyStatus)
  @IsOptional()
  status?: PolicyStatus;
}

export class EnrollCropInsuranceDto {
  @IsString()
  @IsNotEmpty()
  policyId: string;

  @IsString()
  @IsNotEmpty()
  farmerName: string;

  @IsString()
  @IsNotEmpty()
  farmerPhone: string;

  @IsString()
  @IsOptional()
  farmerNid?: string;

  @IsString()
  @IsNotEmpty()
  plotAddress: string;

  @IsString()
  @IsNotEmpty()
  plotDistrict: string;

  @IsString()
  @IsNotEmpty()
  plotUpazila: string;

  @IsString()
  @IsOptional()
  plotUnion?: string;

  @IsString()
  @IsOptional()
  plotVillage?: string;

  @IsString()
  @IsOptional()
  plotDagNo?: string;

  @IsNumber()
  @IsOptional()
  plotGpsLat?: number;

  @IsNumber()
  @IsOptional()
  plotGpsLng?: number;

  @IsNumber()
  @Min(0.1)
  landAreaBighas: number;

  @IsString()
  @IsNotEmpty()
  payoutMfsNumber: string; // bKash or Nagad wallet for instant compensation
}

export class FileInsuranceClaimDto {
  @IsNumber()
  triggerBreachValue: number;

  @IsDateString()
  @IsOptional()
  triggerBreachDate?: string;

  @IsEnum(ClaimDisasterSeverity)
  disasterSeverity: ClaimDisasterSeverity;

  @IsString()
  @IsOptional()
  farmerDamageNotes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  damagePhotos?: string[];

  @IsEnum(ClaimPayoutMethod)
  @IsOptional()
  payoutMethod?: ClaimPayoutMethod;
}

export class SimulateTelemetryTriggerDto {
  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  upazila: string;

  @IsString()
  @IsNotEmpty()
  stationName: string;

  @IsEnum(ParametricTriggerType)
  triggerType: ParametricTriggerType;

  @IsNumber()
  measuredValue: number;

  @IsString()
  @IsNotEmpty()
  unit: string;
}

export class ApproveDisbursementDto {
  @IsNumber()
  @Min(1)
  @Max(100)
  damagePct: number;

  @IsEnum(ClaimPayoutMethod)
  payoutMethod: ClaimPayoutMethod;

  @IsString()
  @IsNotEmpty()
  payoutTransactionRef: string;

  @IsString()
  @IsOptional()
  adminApprovalNotes?: string;
}

export class QueryPolicyDto {
  @IsEnum(CropType)
  @IsOptional()
  cropType?: CropType;

  @IsEnum(AgriSeason)
  @IsOptional()
  season?: AgriSeason;

  @IsString()
  @IsOptional()
  district?: string;

  @IsEnum(PolicyStatus)
  @IsOptional()
  status?: PolicyStatus;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
