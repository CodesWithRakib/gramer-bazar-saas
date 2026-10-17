import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  HerbalSpecies,
  PlantPartUsed,
  ProcessingState,
  GACPStandardGrade,
  LabCertificateStatus,
  SourcingContractStatus,
} from '../enums/herbal-supply.enum.js';

export class CreateHerbalBatchDto {
  @IsString()
  @IsNotEmpty()
  cooperativeName!: string;

  @IsString()
  @IsNotEmpty()
  growerPhone!: string;

  @IsString()
  @IsNotEmpty()
  growerDistrict!: string;

  @IsString()
  @IsNotEmpty()
  growerUpazila!: string;

  @IsEnum(HerbalSpecies)
  species!: HerbalSpecies;

  @IsString()
  @IsNotEmpty()
  scientificName!: string;

  @IsEnum(PlantPartUsed)
  plantPart!: PlantPartUsed;

  @IsEnum(ProcessingState)
  processingState!: ProcessingState;

  @IsString()
  @IsNotEmpty()
  harvestedDate!: string; // YYYY-MM-DD

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  totalWeightKg!: number;

  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  moistureContentPercentage!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  activePhytochemicalPercentage?: number;

  @IsOptional()
  @IsString()
  phytochemicalMarkerName?: string;

  @IsOptional()
  @IsString()
  labReportNumber?: string;

  @IsOptional()
  @IsString()
  testingLaboratory?: string;

  @IsEnum(GACPStandardGrade)
  gacpGrade!: GACPStandardGrade;

  @IsEnum(LabCertificateStatus)
  certStatus!: LabCertificateStatus;

  @IsNumber()
  @Min(10)
  @Type(() => Number)
  pricePerKgBdt!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  minOrderKg?: number;

  @IsOptional()
  @IsBoolean()
  isOrganicCertified?: boolean;

  @IsOptional()
  @IsString()
  storageWarehouseConditions?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateHerbalBatchDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalWeightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(10)
  @Type(() => Number)
  pricePerKgBdt?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  moistureContentPercentage?: number;

  @IsOptional()
  @IsEnum(GACPStandardGrade)
  gacpGrade?: GACPStandardGrade;

  @IsOptional()
  @IsEnum(LabCertificateStatus)
  certStatus?: LabCertificateStatus;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  labReportNumber?: string;

  @IsOptional()
  @IsString()
  testingLaboratory?: string;
}

export class CreatePharmaContractDto {
  @IsString()
  @IsNotEmpty()
  buyerCompanyName!: string;

  @IsString()
  @IsNotEmpty()
  buyerContactPerson!: string;

  @IsString()
  @IsNotEmpty()
  buyerPhone!: string;

  @IsString()
  @IsNotEmpty()
  sellerCooperativeId!: string;

  @IsString()
  @IsNotEmpty()
  cooperativeName!: string;

  @IsEnum(HerbalSpecies)
  species!: HerbalSpecies;

  @IsEnum(PlantPartUsed)
  plantPart!: PlantPartUsed;

  @IsEnum(ProcessingState)
  processingState!: ProcessingState;

  @IsNumber()
  @Min(50)
  @Type(() => Number)
  targetWeightKg!: number;

  @IsNumber()
  @Min(10)
  @Type(() => Number)
  agreedPricePerKgBdt!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(25)
  @Type(() => Number)
  maxAllowedMoisturePercentage?: number;

  @IsString()
  @IsNotEmpty()
  deliveryDeadline!: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  destinationWarehouseDistrict!: string;

  @IsOptional()
  @IsString()
  specialPharmacopoeiaSpecifications?: string;
}

export class RecordMoistureAuditDto {
  @IsString()
  @IsNotEmpty()
  batchId!: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  testedMoisturePercentage!: number;

  @IsOptional()
  @IsBoolean()
  isAflatoxinDetected?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  leadHeavyMetalPpm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  foreignMatterPercentage?: number;

  @IsString()
  @IsNotEmpty()
  inspectorName!: string;

  @IsOptional()
  @IsString()
  inspectorNotes?: string;
}

export class FreshToDryCalculatorDto {
  @IsEnum(HerbalSpecies)
  species!: HerbalSpecies;

  @IsEnum(PlantPartUsed)
  plantPart!: PlantPartUsed;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  freshHarvestKg!: number;
}

export class QueryHerbalBatchesDto {
  @IsOptional()
  @IsEnum(HerbalSpecies)
  species?: HerbalSpecies;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsEnum(GACPStandardGrade)
  gacpGrade?: GACPStandardGrade;

  @IsOptional()
  @IsBoolean()
  pharmaGradeOnly?: boolean;
}
