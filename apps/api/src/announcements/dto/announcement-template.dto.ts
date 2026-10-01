import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AudienceType, AnnouncementPriority } from '../entities/announcement.entity.js';
import { Role } from '../../roles/enums/role.enum.js';

export class CreateAnnouncementTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

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

  @ApiPropertyOptional({ enum: AudienceType })
  @IsEnum(AudienceType)
  @IsOptional()
  audienceType?: AudienceType;

  @ApiPropertyOptional({ enum: Role, isArray: true })
  @IsArray()
  @IsEnum(Role, { each: true })
  @IsOptional()
  targetRoles?: Role[];
}

import { PartialType } from '@nestjs/swagger';
export class UpdateAnnouncementTemplateDto extends PartialType(CreateAnnouncementTemplateDto) {}
