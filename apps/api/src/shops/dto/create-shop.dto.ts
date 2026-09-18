import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShopDto {
  @ApiProperty({ description: 'Seller ID (User ID)' })
  @IsUUID()
  @IsNotEmpty()
  sellerId: string;

  @ApiProperty({ description: 'English name of the shop', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nameEn: string;

  @ApiProperty({ description: 'Bangla name of the shop', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameBn: string;

  @ApiProperty({ description: 'Unique URL slug for the shop' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ description: 'Shop description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ description: 'Banner image URL' })
  @IsOptional()
  @IsString()
  banner?: string;

  @ApiPropertyOptional({ description: 'Whether the shop is verified by admin' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Whether the shop is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
