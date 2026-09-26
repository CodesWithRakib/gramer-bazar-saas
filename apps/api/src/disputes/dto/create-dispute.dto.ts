import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeReason } from '../enums/dispute-reason.enum.js';

export class CreateDisputeDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Order UUID' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ enum: DisputeReason, example: DisputeReason.DAMAGED })
  @IsEnum(DisputeReason)
  @IsNotEmpty()
  reason: DisputeReason;

  @ApiProperty({ example: 'Products arrived damaged during transit' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: ['https://images.unsplash.com/evidence1.jpg'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  evidenceImages?: string[];
}
