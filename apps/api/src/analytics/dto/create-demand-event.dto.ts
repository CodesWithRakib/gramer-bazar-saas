import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsUUID,
  IsString,
  IsOptional,
  ValidateNested,
  IsArray,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { DemandEventType } from '../enums/demand-event.enum.js';

export class CreateDemandEventDto {
  @ApiProperty({ enum: DemandEventType })
  @IsEnum(DemandEventType)
  eventType: DemandEventType;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @ValidateIf((o) => typeof o.productId === 'string' && o.productId.length > 0)
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @ValidateIf((o) => typeof o.categoryId === 'string' && o.categoryId.length > 0)
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  searchQuery?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @ValidateIf((o) => typeof o.productRequestId === 'string' && o.productRequestId.length > 0)
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
