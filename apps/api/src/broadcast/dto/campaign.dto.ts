import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  Matches,
} from 'class-validator';
import {
  BroadcastAudienceType,
  BroadcastProviderName,
  BroadcastRecipientStatus,
  BroadcastStatus,
} from '../enums/broadcast.enums.js';

const PHONE_PATTERN = /^\+?[0-9]{6,20}$/;

export class BroadcastAudienceConfigDto {
  @ApiPropertyOptional({ type: [String], description: 'Required for SELECTED_CUSTOMERS' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5000)
  @IsUUID('4', { each: true })
  customerIds?: string[];

  @ApiPropertyOptional({ description: 'Required for AREA_BASED' })
  @IsOptional()
  @IsUUID()
  districtId?: string;

  @ApiPropertyOptional({ description: 'Optional for AREA_BASED' })
  @IsOptional()
  @IsUUID()
  areaId?: string;

  @ApiPropertyOptional({ example: 30, description: 'Lookback window for ACTIVE/INACTIVE/NO_RECENT_ORDER' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  inactiveDays?: number;

  @ApiPropertyOptional({ default: true, description: 'Exclude customers who opted out of marketing' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  isOptInRequired?: boolean;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string' },
    description: 'Optional manual variable mapping applied to every recipient',
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;
}

export class CreateBroadcastCampaignDto {
  @ApiProperty({ example: 'Eid Flash Sale — WhatsApp Campaign' })
  @IsString()
  @Length(2, 200)
  title: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  templateId: string;

  @ApiProperty({ enum: BroadcastAudienceType })
  @IsEnum(BroadcastAudienceType)
  audienceType: BroadcastAudienceType;

  @ApiPropertyOptional({ type: BroadcastAudienceConfigDto })
  @IsOptional()
  @IsObject()
  audienceConfig?: BroadcastAudienceConfigDto;

  @ApiPropertyOptional({
    example: '2026-10-05T10:00:00.000Z',
    description: 'Schedule for later. Omit to keep the campaign as a draft.',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class UpdateBroadcastCampaignDto extends PartialType(CreateBroadcastCampaignDto) {}

export class TestBroadcastSendDto {
  @ApiProperty({ example: '+8801700000000' })
  @IsString()
  @Matches(PHONE_PATTERN, { message: 'phone must be a valid phone number' })
  phone: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string' },
    description: 'Sample variable values used to render the message',
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;
}

export class QueryBroadcastsDto {
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

  @ApiPropertyOptional({ enum: BroadcastStatus })
  @IsOptional()
  @IsEnum(BroadcastStatus)
  status?: BroadcastStatus;

  @ApiPropertyOptional({ enum: BroadcastAudienceType })
  @IsOptional()
  @IsEnum(BroadcastAudienceType)
  audienceType?: BroadcastAudienceType;

  @ApiPropertyOptional({ description: 'Search by campaign title, template name or creator' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: '2026-09-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-10-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ enum: ['createdAt', 'scheduledAt', 'totalRecipients'], default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'scheduledAt' | 'totalRecipients';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

export class QueryBroadcastRecipientsDto {
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

  @ApiPropertyOptional({ enum: BroadcastRecipientStatus })
  @IsOptional()
  @IsEnum(BroadcastRecipientStatus)
  status?: BroadcastRecipientStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class BroadcastStatsDto {
  @ApiProperty() totalRecipients: number;
  @ApiProperty() pending: number;
  @ApiProperty() queued: number;
  @ApiProperty() sending: number;
  @ApiProperty() sent: number;
  @ApiProperty() delivered: number;
  @ApiProperty() read: number;
  @ApiProperty() failed: number;
  @ApiProperty({ description: 'True when these numbers are simulated by the mock provider' })
  simulated: boolean;
}

export class BroadcastResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiPropertyOptional({ nullable: true }) templateId: string | null;
  @ApiPropertyOptional({ nullable: true }) templateName: string | null;
  @ApiProperty({ enum: BroadcastProviderName }) provider: BroadcastProviderName;
  @ApiProperty({ enum: BroadcastAudienceType }) audienceType: BroadcastAudienceType;
  @ApiPropertyOptional({ nullable: true }) audienceConfig: BroadcastAudienceConfigDto | null;
  @ApiProperty({ enum: BroadcastStatus }) status: BroadcastStatus;
  @ApiPropertyOptional({ nullable: true }) scheduledAt: string | null;
  @ApiPropertyOptional({ nullable: true }) startedAt: string | null;
  @ApiPropertyOptional({ nullable: true }) completedAt: string | null;
  @ApiPropertyOptional({ nullable: true }) cancelledAt: string | null;
  @ApiPropertyOptional({ nullable: true }) failureReason: string | null;
  @ApiProperty() totalRecipients: number;
  @ApiProperty() sentCount: number;
  @ApiProperty() deliveredCount: number;
  @ApiProperty() readCount: number;
  @ApiProperty() failedCount: number;
  @ApiPropertyOptional({ nullable: true }) createdBy: string | null;
  @ApiPropertyOptional({ nullable: true }) createdByName: string | null;
  @ApiProperty() simulated: boolean;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
}

export class BroadcastRecipientResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() broadcastId: string;
  @ApiPropertyOptional({ nullable: true }) customerId: string | null;
  @ApiPropertyOptional({ nullable: true }) customerName: string | null;
  @ApiProperty() phone: string;
  @ApiPropertyOptional({ nullable: true }) personalizedMessage: string | null;
  @ApiProperty({ enum: BroadcastRecipientStatus }) status: BroadcastRecipientStatus;
  @ApiPropertyOptional({ nullable: true }) providerMessageId: string | null;
  @ApiProperty() attemptCount: number;
  @ApiPropertyOptional({ nullable: true }) sentAt: string | null;
  @ApiPropertyOptional({ nullable: true }) deliveredAt: string | null;
  @ApiPropertyOptional({ nullable: true }) readAt: string | null;
  @ApiPropertyOptional({ nullable: true }) failedAt: string | null;
  @ApiPropertyOptional({ nullable: true }) failedReason: string | null;
  @ApiProperty() createdAt: string;
}
