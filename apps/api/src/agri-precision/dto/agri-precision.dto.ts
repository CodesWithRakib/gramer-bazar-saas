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
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CropTargetNutrient,
  DroneBookingStatus,
  DroneServiceType,
  InputCategory,
  InputVerificationStatus,
  SoilTextureType,
} from '../enums/agri-precision.enum.js';

export class VerifyAgriInputDto {
  @IsString()
  @IsNotEmpty()
  barcodeOrQrCode: string;
}

export class CreateAgriInputDto {
  @IsString()
  @IsNotEmpty()
  barcodeOrQrCode: string;

  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @IsString()
  @IsNotEmpty()
  brandName: string;

  @IsString()
  @IsNotEmpty()
  manufacturerName: string;

  @IsEnum(InputCategory)
  category: InputCategory;

  @IsString()
  @IsNotEmpty()
  activeIngredients: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  standardPurityPct?: number = 99.0;

  @IsString()
  @IsNotEmpty()
  daeRegistrationNo: string;

  @IsDateString()
  manufactureDate: string;

  @IsDateString()
  expiryDate: string;

  @IsEnum(InputVerificationStatus)
  @IsOptional()
  status?: InputVerificationStatus = InputVerificationStatus.AUTHENTIC_CERTIFIED;

  @IsNumber()
  @Min(1)
  mrpPriceBdt: number;

  @IsString()
  @IsNotEmpty()
  standardDosageGuide: string;
}

export class ReportCounterfeitInputDto {
  @IsString()
  @IsNotEmpty()
  suspectedItemBarcode: string;

  @IsString()
  @IsNotEmpty()
  brandName: string;

  @IsString()
  @IsNotEmpty()
  reporterName: string;

  @IsString()
  @IsNotEmpty()
  reporterPhone: string;

  @IsString()
  @IsNotEmpty()
  retailShopName: string;

  @IsString()
  @IsNotEmpty()
  retailShopDistrict: string;

  @IsString()
  @IsNotEmpty()
  retailShopUpazila: string;

  @IsString()
  @IsNotEmpty()
  retailShopAddress: string;

  @IsString()
  @IsNotEmpty()
  suspectedDefectDescription: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  evidencePhotos?: string[];
}

export class RegisterDroneUnitDto {
  @IsString()
  @IsOptional()
  droneCode?: string;

  @IsString()
  @IsNotEmpty()
  pilotName: string;

  @IsString()
  @IsNotEmpty()
  pilotPhone: string;

  @IsString()
  @IsNotEmpty()
  pilotLicenseNo: string;

  @IsString()
  @IsNotEmpty()
  droneModel: string;

  @IsNumber()
  @IsOptional()
  @Min(5)
  tankCapacityLiters?: number = 40.0;

  @IsNumber()
  @Min(50)
  serviceRatePerBigha: number;

  @IsString()
  @IsNotEmpty()
  baseDistrict: string;

  @IsString()
  @IsNotEmpty()
  baseUpazila: string;

  @IsNumber()
  @IsOptional()
  coverageRadiusKm?: number = 30;
}

export class BookDroneSprayingDto {
  @IsString()
  @IsNotEmpty()
  droneUnitId: string;

  @IsEnum(DroneServiceType)
  serviceType: DroneServiceType;

  @IsString()
  @IsNotEmpty()
  targetCrop: string;

  @IsString()
  @IsNotEmpty()
  targetInfestationOrFormula: string;

  @IsString()
  @IsNotEmpty()
  farmerName: string;

  @IsString()
  @IsNotEmpty()
  farmerPhone: string;

  @IsString()
  @IsNotEmpty()
  plotAddress: string;

  @IsString()
  @IsNotEmpty()
  plotDistrict: string;

  @IsString()
  @IsNotEmpty()
  plotUpazila: string;

  @IsNumber()
  @Min(0.5)
  landAreaBighas: number;

  @IsDateString()
  scheduledDate: string;

  @IsString()
  @IsNotEmpty()
  scheduledTimeSlot: string;

  @IsNumber()
  @IsOptional()
  gpsPlotCenterLat?: number;

  @IsNumber()
  @IsOptional()
  gpsPlotCenterLng?: number;
}

export class UpdateDroneBookingStatusDto {
  @IsEnum(DroneBookingStatus)
  status: DroneBookingStatus;

  @IsNumber()
  @IsOptional()
  flightDurationMinutes?: number;

  @IsNumber()
  @IsOptional()
  waterSavedLiters?: number;

  @IsString()
  @IsOptional()
  pilotMissionNotes?: string;
}

export class GenerateSoilHealthCardDto {
  @IsString()
  @IsNotEmpty()
  farmerName: string;

  @IsString()
  @IsNotEmpty()
  farmerPhone: string;

  @IsString()
  @IsNotEmpty()
  plotAddress: string;

  @IsString()
  @IsNotEmpty()
  plotDistrict: string;

  @IsString()
  @IsNotEmpty()
  plotUpazila: string;

  @IsEnum(SoilTextureType)
  soilTexture: SoilTextureType;

  @IsEnum(CropTargetNutrient)
  targetCrop: CropTargetNutrient;

  @IsNumber()
  @Min(0.1)
  landAreaBighas: number;

  @IsNumber()
  @Min(3.0)
  @Max(10.0)
  phLevel: number; // e.g. 5.8

  @IsNumber()
  @Min(0)
  nitrogenKgPerHa: number; // e.g. 140

  @IsNumber()
  @Min(0)
  phosphorusPpm: number; // e.g. 14.5

  @IsNumber()
  @Min(0)
  potassiumMeqPer100g: number; // e.g. 0.18

  @IsNumber()
  @Min(0.1)
  @Max(15)
  organicMatterPct: number; // e.g. 1.25

  @IsNumber()
  @IsOptional()
  zincPpm?: number;

  @IsNumber()
  @IsOptional()
  boronPpm?: number;

  @IsNumber()
  @IsOptional()
  salinityEc?: number;
}

export class QueryDroneUnitsDto {
  @IsString()
  @IsOptional()
  district?: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
