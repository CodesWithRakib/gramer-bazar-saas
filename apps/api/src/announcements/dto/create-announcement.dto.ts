import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AudienceType, AnnouncementPriority, AnnouncementStatus } from '../entities/announcement.entity.js';
import { Role } from '../../roles/enums/role.enum.js';

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  titleBn?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  messageBn?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ctaText?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ctaLink?: string;

  @ApiPropertyOptional({ enum: AnnouncementPriority })
  @IsEnum(AnnouncementPriority)
  @IsOptional()
  priority?: AnnouncementPriority;

  @ApiPropertyOptional({ enum: AnnouncementStatus })
  @IsEnum(AnnouncementStatus)
  @IsOptional()
  status?: AnnouncementStatus;

  @ApiProperty({ enum: AudienceType })
  @IsEnum(AudienceType)
  audienceType: AudienceType;

  @ApiPropertyOptional({ enum: Role, isArray: true })
  @IsArray()
  @IsEnum(Role, { each: true })
  @IsOptional()
  targetRoles?: Role[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  targetUsers?: string[];

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
