import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Fields mirror the `Shop` entity columns (`nameEn`, `nameBn`, `description`,
 * `logo`, `banner`, `isActive`). The shop's contact phone is the seller's own
 * account phone and is edited through `PATCH /auth/me`, not here.
 */
export class UpdateSellerShopDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(150)
  nameEn?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nameBn?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  logo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  banner?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
