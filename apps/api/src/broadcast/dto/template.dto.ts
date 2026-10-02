import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  BroadcastProviderName,
  BroadcastTemplateCategory,
  BroadcastTemplateProviderStatus,
  BroadcastTemplateStatus,
} from '../enums/broadcast.enums.js';

const VARIABLE_KEY_PATTERN = /^[a-zA-Z0-9_]+$/;

export class BroadcastTemplateVariableDto {
  @ApiProperty({ example: 'customer_name' })
  @IsString()
  @Length(1, 60)
  @Matches(VARIABLE_KEY_PATTERN, {
    message: 'Variable keys may contain only letters, numbers and underscores',
  })
  key: string;

  @ApiPropertyOptional({ example: 'Customer name', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string | null;

  @ApiPropertyOptional({ example: 'Rakib', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  example?: string | null;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  required?: boolean;
}

export class CreateBroadcastTemplateDto {
  @ApiProperty({ example: 'Flash Sale Template' })
  @IsString()
  @Length(2, 150)
  name: string;

  @ApiPropertyOptional({ example: 'Weekly flash sale announcement', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional({ example: 'bn', default: 'en' })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  language?: string;

  @ApiPropertyOptional({ enum: BroadcastTemplateCategory, default: BroadcastTemplateCategory.MARKETING })
  @IsOptional()
  @IsEnum(BroadcastTemplateCategory)
  category?: BroadcastTemplateCategory;

  @ApiProperty({
    example:
      'হ্যালো {{customer_name}}, {{shop_name}} এ আজ {{discount}}% ছাড়ে বিশেষ অফার!\n{{offer_link}}',
  })
  @IsString()
  @Length(1, 4000)
  body: string;

  @ApiPropertyOptional({ type: [BroadcastTemplateVariableDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => BroadcastTemplateVariableDto)
  variables?: BroadcastTemplateVariableDto[];

  @ApiPropertyOptional({ enum: BroadcastTemplateStatus, default: BroadcastTemplateStatus.DRAFT })
  @IsOptional()
  @IsEnum(BroadcastTemplateStatus)
  status?: BroadcastTemplateStatus;
}

export class UpdateBroadcastTemplateDto extends PartialType(CreateBroadcastTemplateDto) {}

export class UpdateBroadcastTemplateStatusDto {
  @ApiProperty({ enum: BroadcastTemplateStatus })
  @IsEnum(BroadcastTemplateStatus)
  status: BroadcastTemplateStatus;
}

export class BroadcastTemplateResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional({ nullable: true }) description: string | null;
  @ApiProperty() language: string;
  @ApiProperty({ enum: BroadcastTemplateCategory }) category: BroadcastTemplateCategory;
  @ApiProperty() body: string;
  @ApiProperty({ type: [BroadcastTemplateVariableDto] }) variables: BroadcastTemplateVariableDto[];
  @ApiProperty({ enum: BroadcastProviderName }) provider: BroadcastProviderName;
  @ApiPropertyOptional({ nullable: true }) providerTemplateId: string | null;
  @ApiProperty({ enum: BroadcastTemplateProviderStatus })
  providerStatus: BroadcastTemplateProviderStatus;
  @ApiProperty({ enum: BroadcastTemplateStatus }) status: BroadcastTemplateStatus;
  @ApiPropertyOptional({ nullable: true }) createdBy: string | null;
  @ApiPropertyOptional({ nullable: true }) updatedBy: string | null;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
}

export class QueryBroadcastTemplatesDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ enum: BroadcastTemplateStatus })
  @IsOptional()
  @IsEnum(BroadcastTemplateStatus)
  status?: BroadcastTemplateStatus;

  @ApiPropertyOptional({ enum: BroadcastTemplateCategory })
  @IsOptional()
  @IsEnum(BroadcastTemplateCategory)
  category?: BroadcastTemplateCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
