import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  StayType,
  ExperienceCategory,
  MealPlanOption,
  BookingEscrowStatus,
} from '../enums/agro-tourism.enum.js';

export class CreateFarmStayListingDto {
  @IsString()
  @IsNotEmpty()
  titleEn!: string;

  @IsString()
  @IsNotEmpty()
  titleBn!: string;

  @IsEnum(StayType)
  stayType!: StayType;

  @IsString()
  @IsNotEmpty()
  district!: string;

  @IsString()
  @IsNotEmpty()
  upazila!: string;

  @IsString()
  @IsNotEmpty()
  villageAddress!: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsString()
  @IsNotEmpty()
  hostName!: string;

  @IsString()
  @IsNotEmpty()
  hostPhone!: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  maxGuests!: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  bedroomCount!: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  bedCount!: number;

  @IsOptional()
  @IsBoolean()
  hasAttachedBath?: boolean;

  @IsNumber()
  @Min(100)
  @Type(() => Number)
  nightlyRateBdt!: number;

  @IsNumber()
  @Min(100)
  @Type(() => Number)
  weekendRateBdt!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  allInclusiveMealCostPerPerson?: number;

  @IsOptional()
  @IsBoolean()
  hasSolarElectricity?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPureTubeWellWater?: boolean;

  @IsOptional()
  @IsBoolean()
  hasOrganicFarmHarvestAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  hasClayStoveCooking?: boolean;

  @IsOptional()
  @IsBoolean()
  hasTraditionalBoatTour?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  photos?: string[];
}

export class CreateAgroExperiencePackageDto {
  @IsString()
  @IsNotEmpty()
  farmStayId!: string;

  @IsString()
  @IsNotEmpty()
  titleEn!: string;

  @IsString()
  @IsNotEmpty()
  titleBn!: string;

  @IsEnum(ExperienceCategory)
  category!: ExperienceCategory;

  @IsNumber()
  @Min(0.5)
  @Max(24)
  @Type(() => Number)
  durationHours!: number;

  @IsNumber()
  @Min(50)
  @Type(() => Number)
  pricePerPersonBdt!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  minParticipants?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  maxParticipants?: number;

  @IsOptional()
  @IsBoolean()
  includesSafetyGear?: boolean;

  @IsOptional()
  @IsBoolean()
  includesFarmRefreshment?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CalculateBookingPriceDto {
  @IsString()
  @IsNotEmpty()
  farmStayId!: string;

  @IsString()
  @IsNotEmpty()
  checkInDate!: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  checkOutDate!: string; // YYYY-MM-DD

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  adultGuestsCount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  childGuestsCount?: number;

  @IsEnum(MealPlanOption)
  mealPlan!: MealPlanOption;

  @IsOptional()
  @IsArray()
  selectedExperienceIds?: string[];
}

export class CreateFarmStayBookingDto extends CalculateBookingPriceDto {
  @IsString()
  @IsNotEmpty()
  guestName!: string;

  @IsString()
  @IsNotEmpty()
  guestPhone!: string;

  @IsOptional()
  @IsString()
  guestNidPassport?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}

export class VerifyCheckInDto {
  @IsString()
  @IsNotEmpty()
  bookingNumber!: string;

  @IsString()
  @IsNotEmpty()
  checkInPinCode!: string;
}

export class FarmStayFilterDto {
  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsEnum(StayType)
  stayType?: StayType;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  guests?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxNightlyRate?: number;
}
