import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AgentCashTxType,
  FarmerCollectionStatus,
  SettlementChannel,
  SettlementStatus,
} from '../enums/agent-commerce.enum.js';

export class OpenDrawerDto {
  @IsNumber()
  @Min(0)
  openingFloat: number;

  @IsOptional()
  @IsString()
  hubId?: string;

  @IsOptional()
  @IsString()
  openingNotes?: string;
}

export class CloseDrawerDto {
  @IsNumber()
  @Min(0)
  actualClosingBalance: number;

  @IsOptional()
  @IsString()
  closingNotes?: string;
}

export class RecordCashTxDto {
  @IsEnum(AgentCashTxType)
  type: AgentCashTxType;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  farmerCollectionId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateFarmerCollectionDto {
  @IsString()
  @IsNotEmpty()
  farmerName: string;

  @IsString()
  @IsNotEmpty()
  farmerPhone: string;

  @IsString()
  @IsNotEmpty()
  villageLocation: string;

  @IsString()
  @IsNotEmpty()
  cropType: string;

  @IsNumber()
  @Min(0.1)
  quantityKg: number;

  @IsNumber()
  @Min(0.1)
  unitPricePerKg: number;

  @IsOptional()
  @IsBoolean()
  paidFromDrawer?: boolean;

  @IsOptional()
  @IsString()
  destinationHubId?: string;

  @IsOptional()
  @IsString()
  batchNumber?: string;
}

export class UpdateFarmerCollectionStatusDto {
  @IsEnum(FarmerCollectionStatus)
  status: FarmerCollectionStatus;
}

export class CreateSettlementDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(SettlementChannel)
  settlementChannel: SettlementChannel;

  @IsString()
  @IsNotEmpty()
  channelReference: string;

  @IsOptional()
  @IsString()
  slipReceiptUrl?: string;
}

export class ReviewSettlementDto {
  @IsEnum(SettlementStatus)
  status: SettlementStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class PosCartItemDto {
  @IsString()
  @IsNotEmpty()
  sellerProductId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class AgentPosCheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PosCartItemDto)
  items: PosCartItemDto[];

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @IsString()
  @IsNotEmpty()
  customerAddress: string;

  @IsNumber()
  @Min(0)
  amountTendered: number;

  @IsOptional()
  @IsString()
  lang?: string;
}
