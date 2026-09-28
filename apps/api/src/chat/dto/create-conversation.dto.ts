import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConversationType, SupportPriority } from '../enums/chat.enum.js';

export class CreateConversationDto {
  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'Required for DIRECT conversations',
  })
  @IsString()
  @IsOptional()
  participantId?: string;

  @ApiPropertyOptional({ enum: ConversationType, default: ConversationType.DIRECT })
  @IsEnum(ConversationType)
  @IsOptional()
  type?: ConversationType;

  @ApiPropertyOptional({ example: 'order-12345' })
  @IsString()
  @IsOptional()
  referenceId?: string;

  @ApiPropertyOptional({ example: 'ORDER' })
  @IsString()
  @IsOptional()
  referenceType?: string;

  @ApiPropertyOptional({ example: 'Help with delayed delivery' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({ enum: SupportPriority, default: SupportPriority.MEDIUM })
  @IsEnum(SupportPriority)
  @IsOptional()
  priority?: SupportPriority;

  @ApiPropertyOptional({ example: 'Hello, I need help with my recent purchase.' })
  @IsString()
  @IsOptional()
  initialMessage?: string;
}

export class UpdateSupportCaseDto {
  @ApiPropertyOptional({ example: 'IN_PROGRESS' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ enum: SupportPriority })
  @IsEnum(SupportPriority)
  @IsOptional()
  priority?: SupportPriority;

  @ApiPropertyOptional({ example: 'admin-uuid-12345' })
  @IsString()
  @IsOptional()
  assignedAdminId?: string;
}
