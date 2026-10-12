import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WarehouseHubType } from '../entities/warehouse-hub.entity.js';
import { StockTransferStatus } from '../entities/stock-transfer.entity.js';

export class CreateWarehouseHubDto {
  @ApiProperty({ description: 'Name of the warehouse hub', example: 'Bogra Regional Agro Warehouse' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique code of the hub', example: 'HUB-BGR-01' })
  @IsString()
  code: string;

  @ApiProperty({ enum: WarehouseHubType, example: WarehouseHubType.REGIONAL })
  @IsEnum(WarehouseHubType)
  hubType: WarehouseHubType;

  @ApiProperty({ description: 'Division', example: 'Rajshahi' })
  @IsString()
  division: string;

  @ApiProperty({ description: 'District', example: 'Bogra' })
  @IsString()
  district: string;

  @ApiPropertyOptional({ description: 'Upazila', example: 'Shibganj' })
  @IsOptional()
  @IsString()
  upazila?: string;

  @ApiPropertyOptional({ description: 'Street address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Manager contact phone' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Storage capacity in KG', default: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  capacityKg?: number;
}

export class AllocateHubStockDto {
  @ApiProperty({ description: 'Seller product ID' })
  @IsUUID()
  sellerProductId: string;

  @ApiProperty({ description: 'Quantity to allocate or adjust', example: 50 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: 'Batch number' })
  @IsOptional()
  @IsString()
  batchNumber?: string;
}

export class CreateStockTransferDto {
  @ApiProperty({ description: 'Source warehouse hub ID' })
  @IsUUID()
  fromHubId: string;

  @ApiProperty({ description: 'Destination warehouse hub ID' })
  @IsUUID()
  toHubId: string;

  @ApiProperty({ description: 'Seller product ID being transferred' })
  @IsUUID()
  sellerProductId: string;

  @ApiProperty({ description: 'Quantity to transfer', example: 25 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Transfer notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateStockTransferStatusDto {
  @ApiProperty({ enum: StockTransferStatus, example: StockTransferStatus.RECEIVED })
  @IsEnum(StockTransferStatus)
  status: StockTransferStatus;

  @ApiPropertyOptional({ description: 'Remarks' })
  @IsOptional()
  @IsString()
  notes?: string;
}
