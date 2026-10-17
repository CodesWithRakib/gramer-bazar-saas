import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsArray,
  IsBoolean,
  IsDateString,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MachineryCategory,
  PricingBasis,
  FuelOption,
  OperatorOption,
  MachineryStatus,
  BookingStatus,
  InspectionType,
} from '../enums/machinery.enum.js';

export class CreateMachineryItemDto {
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

  @IsEnum(MachineryCategory)
  category: MachineryCategory;

  @IsString()
  @IsOptional()
  modelNumber?: string;

  @IsEnum(PricingBasis)
  pricingBasis: PricingBasis;

  @IsNumber()
  @Min(0)
  baseRate: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  securityDeposit?: number;

  @IsEnum(FuelOption)
  fuelOption: FuelOption;

  @IsEnum(OperatorOption)
  operatorOption: OperatorOption;

  @IsNumber()
  @IsOptional()
  @Min(0)
  operatorDailyAllowance?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsString()
  @IsNotEmpty()
  division: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  upazila: string;

  @IsString()
  @IsOptional()
  union?: string;

  @IsString()
  @IsOptional()
  village?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  serviceRadiusKm?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  neighborClusterDiscountPct?: number;
}

export class UpdateMachineryItemDto {
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

  @IsEnum(MachineryCategory)
  @IsOptional()
  category?: MachineryCategory;

  @IsString()
  @IsOptional()
  modelNumber?: string;

  @IsEnum(PricingBasis)
  @IsOptional()
  pricingBasis?: PricingBasis;

  @IsNumber()
  @IsOptional()
  @Min(0)
  baseRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  securityDeposit?: number;

  @IsEnum(FuelOption)
  @IsOptional()
  fuelOption?: FuelOption;

  @IsEnum(OperatorOption)
  @IsOptional()
  operatorOption?: OperatorOption;

  @IsNumber()
  @IsOptional()
  @Min(0)
  operatorDailyAllowance?: number;

  @IsEnum(MachineryStatus)
  @IsOptional()
  status?: MachineryStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  division?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  upazila?: string;

  @IsString()
  @IsOptional()
  union?: string;

  @IsString()
  @IsOptional()
  village?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  serviceRadiusKm?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  neighborClusterDiscountPct?: number;
}

export class QuoteMachineryBookingDto {
  @IsString()
  @IsNotEmpty()
  machineryId: string;

  @IsNumber()
  @Min(0.1)
  plotSizeValue: number; // In Bighas, Hours, or Days based on machinery pricingBasis

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

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

  @IsEnum(FuelOption)
  @IsOptional()
  fuelOption?: FuelOption;

  @IsEnum(OperatorOption)
  @IsOptional()
  operatorOption?: OperatorOption;
}

export class CreateMachineryBookingDto extends QuoteMachineryBookingDto {
  @IsString()
  @IsNotEmpty()
  renterName: string;

  @IsString()
  @IsNotEmpty()
  renterPhone: string;

  @IsString()
  @IsNotEmpty()
  plotAddress: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsString()
  @IsOptional()
  cancellationReason?: string;
}

export class CreateMachineryInspectionDto {
  @IsEnum(InspectionType)
  inspectionType: InspectionType;

  @IsNumber()
  @Min(0)
  meterHours: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  fuelLevelPct: number;

  @IsBoolean()
  isEngineOperational: boolean;

  @IsBoolean()
  isOperational: boolean;

  @IsString()
  @IsOptional()
  damageNotes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  damagePhotos?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  claimDamageDeduction?: number;
}

export class ResolveDepositDto {
  @IsNumber()
  @Min(0)
  refundDepositAmount: number;

  @IsNumber()
  @Min(0)
  deductDamageAmount: number;

  @IsString()
  @IsNotEmpty()
  adminNotes: string;
}

export class QueryMachineryDto {
  @IsEnum(MachineryCategory)
  @IsOptional()
  category?: MachineryCategory;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  upazila?: string;

  @IsEnum(PricingBasis)
  @IsOptional()
  pricingBasis?: PricingBasis;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minRate?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxRate?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
