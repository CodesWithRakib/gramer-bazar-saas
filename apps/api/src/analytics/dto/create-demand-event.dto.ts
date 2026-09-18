import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsUUID, IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { DemandEventType } from '../enums/demand-event.enum.js';

export class CreateDemandEventDto {
  @ApiProperty({ enum: DemandEventType })
  @IsEnum(DemandEventType)
  eventType: DemandEventType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  searchQuery?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productRequestId?: string;
}

export class BulkCreateDemandEventDto {
  @ApiProperty({ type: [CreateDemandEventDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDemandEventDto)
  events: CreateDemandEventDto[];
}
