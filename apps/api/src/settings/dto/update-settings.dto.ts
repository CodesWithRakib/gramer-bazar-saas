import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(150)
  platformName?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  supportEmail?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  allowSellerRegistration?: boolean;
}
