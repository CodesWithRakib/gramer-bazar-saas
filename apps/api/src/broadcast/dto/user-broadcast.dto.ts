import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { BroadcastRecipientStatus } from '../enums/broadcast.enums.js';

export class QueryUserBroadcastsDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by text search on title or message body' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter only unread broadcast messages' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  unreadOnly?: boolean;
}

export class UserBroadcastMessageDto {
  @ApiProperty({ description: 'Recipient record ID' })
  id: string;

  @ApiProperty({ description: 'Broadcast campaign ID' })
  broadcastId: string;

  @ApiProperty({ description: 'Campaign title or subject' })
  title: string;

  @ApiPropertyOptional({ description: 'Template name' })
  templateName?: string | null;

  @ApiProperty({ description: 'Rendered personalized broadcast message' })
  message: string;

  @ApiProperty({ enum: BroadcastRecipientStatus })
  status: BroadcastRecipientStatus;

  @ApiProperty({ description: 'Whether the recipient has read the message' })
  isRead: boolean;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  sentAt: Date | null;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  deliveredAt: Date | null;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  readAt: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}

export class UserBroadcastUnreadCountDto {
  @ApiProperty({ example: 3, description: 'Total number of unread broadcast messages for current user' })
  unreadCount: number;
}
