import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  SericultureCraftType,
  SilkGrade,
  YarnMaterial,
  AuthenticityStatus,
  WeavingLoomType,
  CocoonType,
  ArtisanOrderEscrowStatus,
} from '../enums/sericulture-handloom.enum.js';

export class QueryArtisanProductsDto {
  @IsOptional()
  @IsEnum(SericultureCraftType)
  craftType?: SericultureCraftType;

  @IsOptional()
  @IsString()
  originDistrict?: string;

  @IsOptional()
  @IsEnum(SilkGrade)
  silkGrade?: SilkGrade;

  @IsOptional()
  @IsEnum(WeavingLoomType)
  loomType?: WeavingLoomType;

  @IsOptional()
  @IsString()
  search?: string;
}

export class CalculateCocoonReelingDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  freshCocoonWeightKg!: number;

  @IsOptional()
  @IsEnum(CocoonType)
  cocoonType?: CocoonType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  @Max(30)
  shellRatioPercentage?: number;
}

export class CalculateFairWageDto {
  @IsEnum(SericultureCraftType)
  craftType!: SericultureCraftType;

  @IsOptional()
  @IsEnum(YarnMaterial)
  yarnMaterial?: YarnMaterial;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(180)
  weavingDays!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  lengthMeters?: number;

  @IsOptional()
  @IsString()
  zariType?: string;
}

export class CreateHandloomProductDto {
  @IsEnum(SericultureCraftType)
  craftType!: SericultureCraftType;

  @IsString()
  titleBn!: string;

  @IsString()
  titleEn!: string;

  @IsString()
  originDistrict!: string;

  @IsString()
  weavingVillage!: string;

  @IsEnum(WeavingLoomType)
  loomType!: WeavingLoomType;

  @IsEnum(YarnMaterial)
  yarnMaterial!: YarnMaterial;

  @Type(() => Number)
  @IsNumber()
  @Min(20)
  threadCountWarp!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(20)
  threadCountWeft!: number;

  @IsEnum(SilkGrade)
  silkGrade!: SilkGrade;

  @IsEnum(AuthenticityStatus)
  authenticityStatus!: AuthenticityStatus;

  @IsOptional()
  @IsString()
  giCertificateNumber?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  weavingDurationDays!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(100)
  artisanWageBdt!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(200)
  priceBdt!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stockQuantity?: number;

  @IsOptional()
  @IsArray()
  mediaGalleryUrls?: string[];

  @IsOptional()
  @IsString()
  burnTestResultNotes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dimensionsLengthMeters?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dimensionsWidthInches?: number;

  @IsOptional()
  @IsBoolean()
  isCustomOrderAvailable?: boolean;
}

export class CreateCocoonBatchDto {
  @IsString()
  farmerName!: string;

  @IsString()
  farmingDistrict!: string;

  @IsOptional()
  @IsString()
  mulberryVariety?: string;

  @IsEnum(CocoonType)
  cocoonType!: CocoonType;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  freshCocoonWeightKg!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  shellRatioPercentage?: number;

  @IsOptional()
  @IsString()
  reelingFactoryName?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(100)
  pricePerKgBdt!: number;

  @IsOptional()
  @IsBoolean()
  isInspectedByBSDB?: boolean;

  @IsOptional()
  @IsString()
  bsdbInspectorName?: string;

  @IsString()
  harvestDate!: string;
}

export class CreateCustomOrderDto {
  @IsString()
  artisanId!: string;

  @IsString()
  artisanName!: string;

  @IsEnum(SericultureCraftType)
  craftType!: SericultureCraftType;

  @IsString()
  customMotifDescription!: string;

  @IsOptional()
  @IsString()
  primaryColorHex?: string;

  @IsOptional()
  @IsString()
  zariSpecification?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  agreedPriceBdt!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estimatedDeliveryDays?: number;
}

export class UpdateLoomProgressDto {
  @IsEnum(ArtisanOrderEscrowStatus)
  orderStatus!: ArtisanOrderEscrowStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  weftProgressPercentage?: number;

  @IsOptional()
  @IsString()
  inspectionNotes?: string;

  @IsOptional()
  @IsString()
  dispatchedTrackingNumber?: string;
}
