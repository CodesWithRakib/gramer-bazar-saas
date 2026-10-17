import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MilkType,
  MilkShift,
  FeedCategory,
  ChillingVatStatus,
} from '../enums/dairy-supply.enum.js';

export class CalculateMilkRateDto {
  @Type(() => Number)
  @IsNumber()
  @Min(2.0)
  @Max(12.0)
  fatPercentage!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(20.0)
  @Max(36.0)
  lactometerReadingCorrected!: number; // CLR (Corrected Lactometer Reading)

  @IsOptional()
  @IsEnum(MilkType)
  milkType?: MilkType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  volumeLiters?: number;
}

export class CalculateFeedSavingsDto {
  @IsEnum(FeedCategory)
  feedCategory!: FeedCategory;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  herdCowsCount!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  monthlyConsumptionKgPerCow?: number;
}

export class CreateMilkCollectionDto {
  @IsString()
  farmerName!: string;

  @IsString()
  farmerPhone!: string;

  @IsString()
  cooperativeCenterId!: string;

  @IsString()
  cooperativeName!: string;

  @IsEnum(MilkType)
  milkType!: MilkType;

  @IsEnum(MilkShift)
  collectionShift!: MilkShift;

  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  volumeLiters!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(20)
  @Max(36)
  lactometerReadingCorrected!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(2.0)
  @Max(12.0)
  fatPercentage!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1.0)
  @Max(10.0)
  mbrtHours?: number;

  @IsOptional()
  @IsString()
  adulterationNotes?: string;

  @IsString()
  collectionDate!: string;
}

export class RecordChillingTelemetryDto {
  @IsString()
  vatCode!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentVolumeLiters!: number;

  @Type(() => Number)
  @IsNumber()
  currentTemperatureCelsius!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  agitatorRpm?: number;

  @IsOptional()
  @IsString()
  compressorStatus?: string;

  @IsOptional()
  @IsEnum(ChillingVatStatus)
  vatStatus?: ChillingVatStatus;

  @IsOptional()
  @IsBoolean()
  isAlarmActive?: boolean;

  @IsOptional()
  @IsString()
  alarmReason?: string;
}

export class CreateFeedPoolDto {
  @IsEnum(FeedCategory)
  feedCategory!: FeedCategory;

  @IsString()
  feedBrandOrMillName!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(100)
  targetVolumeKg!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(10)
  discountedPricePerKgBdt!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(10)
  retailMarketPricePerKgBdt!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(2)
  minimumFarmerParticipants?: number;

  @IsString()
  deliveryHubLocation!: string;

  @IsString()
  poolClosingDate!: string;
}

export class JoinFeedPoolDto {
  @IsString()
  poolId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(25)
  orderedKg!: number;
}
