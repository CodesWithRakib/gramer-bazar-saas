import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ContractCropType,
  CampaignStatus,
  AgreementStatus,
  MilestoneStage,
  DeliveryGrade,
} from '../enums/contract-farming.enum.js';

export class CreateContractCampaignDto {
  @IsString()
  @IsOptional()
  campaignCode?: string;

  @IsString()
  @IsNotEmpty()
  buyerCompanyName: string;

  @IsString()
  @IsNotEmpty()
  titleEn: string;

  @IsString()
  @IsNotEmpty()
  titleBn: string;

  @IsString()
  @IsNotEmpty()
  descriptionEn: string;

  @IsString()
  @IsNotEmpty()
  descriptionBn: string;

  @IsEnum(ContractCropType)
  cropType: ContractCropType;

  @IsString()
  @IsNotEmpty()
  targetSeason: string;

  @IsString()
  @IsNotEmpty()
  targetDistrict: string;

  @IsString()
  @IsOptional()
  targetUpazila?: string;

  @IsNumber()
  @Min(0.5)
  targetTotalAcres: number;

  @IsNumber()
  @Min(1)
  guaranteedFloorPricePerKg: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  advanceInputCashPct?: number = 25.0;

  @IsNumber()
  @Min(10)
  estimatedYieldPerBighaKg: number;

  @IsString()
  @IsNotEmpty()
  qualityStandardSpecs: string;

  @IsString()
  @IsNotEmpty()
  intakeDropWarehouseName: string;
}

export class UpdateContractCampaignDto {
  @IsString()
  @IsOptional()
  buyerCompanyName?: string;

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

  @IsEnum(ContractCropType)
  @IsOptional()
  cropType?: ContractCropType;

  @IsString()
  @IsOptional()
  targetSeason?: string;

  @IsString()
  @IsOptional()
  targetDistrict?: string;

  @IsString()
  @IsOptional()
  targetUpazila?: string;

  @IsNumber()
  @IsOptional()
  @Min(0.5)
  targetTotalAcres?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  guaranteedFloorPricePerKg?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  advanceInputCashPct?: number;

  @IsNumber()
  @IsOptional()
  @Min(10)
  estimatedYieldPerBighaKg?: number;

  @IsString()
  @IsOptional()
  qualityStandardSpecs?: string;

  @IsString()
  @IsOptional()
  intakeDropWarehouseName?: string;

  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;
}

export class ApplyContractAgreementDto {
  @IsString()
  @IsNotEmpty()
  campaignId: string;

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
  @Min(0.5)
  landAreaBighas: number;

  @IsString()
  @IsNotEmpty()
  farmerPayoutMfsOrBank: string; // e.g. bKash 017xxxxxxxx or Bank A/C details
}

export class UpdateAgreementStatusDto {
  @IsEnum(AgreementStatus)
  status: AgreementStatus;

  @IsNumber()
  @IsOptional()
  advanceWorkingCapitalDisbursed?: number;
}

export class SubmitMilestoneInspectionDto {
  @IsEnum(MilestoneStage)
  milestoneStage: MilestoneStage;

  @IsBoolean()
  isPassed: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  germinationRatePct?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  cropHealthScore: number;

  @IsString()
  @IsOptional()
  pestInfestationLevel?: string;

  @IsString()
  @IsNotEmpty()
  growthObservations: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  inspectionPhotos?: string[];

  @IsString()
  @IsOptional()
  recommendations?: string;
}

export class RecordHarvestDeliveryDto {
  @IsString()
  @IsOptional()
  deliveryVoucherNo?: string;

  @IsNumber()
  @Min(1)
  grossWeightKg: number;

  @IsNumber()
  @Min(0)
  tareWeightKg: number;

  @IsEnum(DeliveryGrade)
  acceptedGrade: DeliveryGrade;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  qualityMoisturePct?: number;

  @IsString()
  @IsOptional()
  weighbridgeSlipPhoto?: string;

  @IsString()
  @IsNotEmpty()
  weighbridgeOperatorName: string;
}

export class SettleAgreementFinalEscrowDto {
  @IsString()
  @IsOptional()
  settlementNotes?: string;
}

export class QueryContractCampaignDto {
  @IsEnum(ContractCropType)
  @IsOptional()
  cropType?: ContractCropType;

  @IsString()
  @IsOptional()
  targetDistrict?: string;

  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
