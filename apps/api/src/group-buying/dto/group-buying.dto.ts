import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  GroupBuyCampaignStatus,
  GroupBuyPaymentMode,
  GroupBuyPoolStatus,
} from '../enums/group-buying.enum.js';

export class TierPricingDto {
  @IsNumber()
  @Min(1)
  minQty: number;

  @IsNumber()
  @Min(1)
  price: number;
}

export class CreateGroupBuyCampaignDto {
  @IsString()
  @IsNotEmpty()
  titleEn: string;

  @IsString()
  @IsNotEmpty()
  titleBn: string;

  @IsString()
  @IsNotEmpty()
  sellerProductId: string;

  @IsNumber()
  @Min(1)
  regularPrice: number;

  @IsNumber()
  @Min(1)
  groupPrice: number;

  @IsNumber()
  @Min(2)
  minParticipants: number;

  @IsOptional()
  @IsNumber()
  @Min(2)
  maxParticipants?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationHours?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TierPricingDto)
  tieredPricing?: TierPricingDto[];

  @IsOptional()
  @IsString()
  targetDistrict?: string;

  @IsOptional()
  @IsString()
  targetUpazila?: string;

  @IsString()
  @IsNotEmpty()
  dropPointName: string;
}

export class UpdateGroupBuyCampaignDto {
  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  titleBn?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  regularPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  groupPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(2)
  minParticipants?: number;

  @IsOptional()
  @IsEnum(GroupBuyCampaignStatus)
  status?: GroupBuyCampaignStatus;

  @IsOptional()
  @IsString()
  dropPointName?: string;
}

export class StartPoolDto {
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsOptional()
  @IsEnum(GroupBuyPaymentMode)
  paymentMode?: GroupBuyPaymentMode;
}

export class JoinPoolDto {
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsOptional()
  @IsEnum(GroupBuyPaymentMode)
  paymentMode?: GroupBuyPaymentMode;
}

export class QueryCampaignDto {
  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  upazila?: string;

  @IsOptional()
  @IsEnum(GroupBuyCampaignStatus)
  status?: GroupBuyCampaignStatus;
}
