import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  LivestockCategory,
  LivestockBreed,
  LivestockListingStatus,
  VeterinaryHealthStatus,
  VaccineType,
  AIServiceStatus,
  LivestockTransportStatus,
} from '../enums/livestock.enum.js';

export class CreateLivestockListingDto {
  @IsString()
  @IsNotEmpty()
  sellerName!: string;

  @IsString()
  @IsNotEmpty()
  sellerPhone!: string;

  @IsString()
  @IsNotEmpty()
  sellerDistrict!: string;

  @IsString()
  @IsNotEmpty()
  sellerUpazila!: string;

  @IsString()
  @IsNotEmpty()
  earTagNumber!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(LivestockCategory)
  category!: LivestockCategory;

  @IsEnum(LivestockBreed)
  breed!: LivestockBreed;

  @IsString()
  @IsNotEmpty()
  gender!: 'MALE' | 'FEMALE';

  @IsNumber()
  @Type(() => Number)
  @Min(10)
  liveWeightKg!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(8)
  teethCount!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  ageMonths!: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  dailyMilkYieldLiters?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parity?: number;

  @IsOptional()
  @IsBoolean()
  isPregnant?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pregnancyMonths?: number;

  @IsOptional()
  @IsString()
  colorPattern?: string;

  @IsNumber()
  @Type(() => Number)
  @Min(500)
  askingPrice!: number;

  @IsOptional()
  @IsBoolean()
  negotiable?: boolean;

  @IsOptional()
  @IsBoolean()
  qurbaniEligible?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}

export class UpdateLivestockListingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  liveWeightKg?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  askingPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  dailyMilkYieldLiters?: number;

  @IsOptional()
  @IsEnum(LivestockListingStatus)
  listingStatus?: LivestockListingStatus;

  @IsOptional()
  @IsEnum(VeterinaryHealthStatus)
  healthStatus?: VeterinaryHealthStatus;
}

export class LivestockQueryDto {
  @IsOptional()
  @IsEnum(LivestockCategory)
  category?: LivestockCategory;

  @IsOptional()
  @IsEnum(LivestockBreed)
  breed?: LivestockBreed;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsBoolean()
  qurbaniOnly?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minWeight?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;
}

export class CommitEscrowPurchaseDto {
  @IsString()
  @IsNotEmpty()
  buyerName!: string;

  @IsString()
  @IsNotEmpty()
  buyerPhone!: string;

  @IsNumber()
  @Type(() => Number)
  escrowAmount!: number;
}

export class RecordHealthPassportDto {
  @IsString()
  @IsNotEmpty()
  earTagNumber!: string;

  @IsString()
  @IsNotEmpty()
  livestockId!: string;

  @IsString()
  @IsNotEmpty()
  veterinaryOfficerName!: string;

  @IsString()
  @IsNotEmpty()
  veterinaryRegNumber!: string;

  @IsString()
  @IsNotEmpty()
  upazilaHospital!: string;

  @IsEnum(VeterinaryHealthStatus)
  healthCertification!: VeterinaryHealthStatus;

  @IsNumber()
  @Type(() => Number)
  bodyTemperatureCelsius!: number;

  @IsOptional()
  @IsString()
  dewormingDate?: string;

  @IsOptional()
  @IsString()
  healthRemarks?: string;
}

export class AddVaccineRecordDto {
  @IsEnum(VaccineType)
  vaccine!: VaccineType;

  @IsString()
  @IsNotEmpty()
  doseDate!: string;

  @IsString()
  @IsNotEmpty()
  nextDueDate!: string;

  @IsString()
  @IsNotEmpty()
  batchNo!: string;

  @IsString()
  @IsNotEmpty()
  administeredBy!: string;
}

export class CreateAIBookingDto {
  @IsString()
  @IsNotEmpty()
  farmerName!: string;

  @IsString()
  @IsNotEmpty()
  farmerPhone!: string;

  @IsString()
  @IsNotEmpty()
  farmerDistrict!: string;

  @IsString()
  @IsNotEmpty()
  farmerUpazila!: string;

  @IsString()
  @IsNotEmpty()
  targetDamEarTag!: string;

  @IsEnum(LivestockBreed)
  targetDamBreed!: LivestockBreed;

  @IsEnum(LivestockBreed)
  desiredSireBreed!: LivestockBreed;

  @IsOptional()
  @IsString()
  strawSource?: string;

  @IsString()
  @IsNotEmpty()
  heatObservationDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAIBookingStatusDto {
  @IsEnum(AIServiceStatus)
  status!: AIServiceStatus;

  @IsOptional()
  @IsString()
  technicianName?: string;

  @IsOptional()
  @IsString()
  technicianPhone?: string;

  @IsOptional()
  @IsString()
  inseminationDate?: string;

  @IsOptional()
  @IsString()
  pregnancyCheckDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateLivestockTransportDto {
  @IsString()
  @IsNotEmpty()
  buyerName!: string;

  @IsString()
  @IsNotEmpty()
  buyerPhone!: string;

  @IsString()
  @IsNotEmpty()
  livestockId!: string;

  @IsString()
  @IsNotEmpty()
  earTagNumber!: string;

  @IsString()
  @IsNotEmpty()
  pickupDistrict!: string;

  @IsString()
  @IsNotEmpty()
  pickupUpazila!: string;

  @IsString()
  @IsNotEmpty()
  pickupAddress!: string;

  @IsString()
  @IsNotEmpty()
  dropoffDistrict!: string;

  @IsString()
  @IsNotEmpty()
  dropoffUpazila!: string;

  @IsString()
  @IsNotEmpty()
  dropoffAddress!: string;

  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsNumber()
  @Type(() => Number)
  fareAmount!: number;

  @IsOptional()
  @IsBoolean()
  hasTransitInsurance?: boolean;
}

export class UpdateTransportStatusDto {
  @IsEnum(LivestockTransportStatus)
  status!: LivestockTransportStatus;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsString()
  driverPhone?: string;

  @IsOptional()
  @IsString()
  vehiclePlateNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
