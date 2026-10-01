import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImpersonationReason } from '../enums/impersonation.enum.js';

export class StartImpersonationDto {
  @ApiProperty({ description: 'Target user UUID (Customer, Seller, or Rider)', format: 'uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: ImpersonationReason, description: 'Reason for starting impersonation' })
  @IsEnum(ImpersonationReason)
  reason: ImpersonationReason;

  @ApiPropertyOptional({
    description: 'Short free-form note. Required when reason is OTHER.',
    maxLength: 300,
  })
  @ValidateIf((dto: StartImpersonationDto) => dto.reason === ImpersonationReason.OTHER)
  @IsString()
  @MaxLength(300)
  reasonNote?: string;

  @ApiPropertyOptional({ description: 'Ignored free-form note for non-OTHER reasons' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}
