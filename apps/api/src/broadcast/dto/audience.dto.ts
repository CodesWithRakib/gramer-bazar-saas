import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { BroadcastAudienceType } from '../enums/broadcast.enums.js';
import { BroadcastAudienceConfigDto } from './campaign.dto.js';

export class PreviewAudienceDto {
  @ApiProperty({ enum: BroadcastAudienceType })
  @IsEnum(BroadcastAudienceType)
  audienceType: BroadcastAudienceType;

  @ApiPropertyOptional({ type: BroadcastAudienceConfigDto })
  @IsOptional()
  audienceConfig?: BroadcastAudienceConfigDto;
}

export class SearchCustomersDto {
  @ApiPropertyOptional({ example: 'Rakib' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class CustomerSummaryDto {
  @ApiProperty() id: string;
  @ApiPropertyOptional({ nullable: true }) name: string | null;
  @ApiProperty() phone: string;
  @ApiPropertyOptional({ nullable: true }) email: string | null;
  @ApiPropertyOptional({ nullable: true }) lastLoginAt: string | null;
  @ApiProperty({ description: 'False when the customer opted out of marketing' })
  marketingOptIn: boolean;
}

export class AudienceSegmentSummaryDto {
  @ApiProperty() totalCustomers: number;
  @ApiProperty() optedInCustomers: number;
  @ApiProperty() optedOutCustomers: number;
}

export class AudiencePreviewResponseDto {
  @ApiProperty({ enum: BroadcastAudienceType })
  audienceType: BroadcastAudienceType;

  @ApiProperty({ description: 'Number of recipients that will receive the campaign' })
  recipientCount: number;

  @ApiProperty({ description: 'Customers excluded because they opted out of marketing' })
  excludedOptOutCount: number;

  @ApiProperty({ type: [CustomerSummaryDto], description: 'A small sample for previewing' })
  sample: CustomerSummaryDto[];

  @ApiProperty({ type: AudienceSegmentSummaryDto })
  segments: AudienceSegmentSummaryDto;
}

