import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, IsUUID } from 'class-validator';
import { DisputeReason } from '../enums/dispute-reason.enum.js';

export class CreateDisputeDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @IsEnum(DisputeReason)
  @IsNotEmpty()
  reason: DisputeReason;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  evidenceImages?: string[];
}
