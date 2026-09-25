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
  @IsString()
  @IsOptional()
  @MaxLength(30)
  supportPhone?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  allowSellerRegistration?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isMaintenanceMode?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sslczStoreId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sslczStorePassword?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  sslczIsLive?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sslczPublicUrl?: string;
}
