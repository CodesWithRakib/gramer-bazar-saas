import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DisputeStatus } from '../enums/dispute-status.enum.js';

export class ResolveDisputeDto {
  @IsEnum(DisputeStatus)
  @IsNotEmpty()
  status: DisputeStatus;

  @IsString()
  @IsOptional()
  adminDecision?: string;
}
