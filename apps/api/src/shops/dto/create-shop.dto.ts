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

  @ApiPropertyOptional({ description: 'Short description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

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

  @ApiPropertyOptional({ description: 'Public phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ description: 'Secondary phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  secondaryPhone?: string;

  @ApiPropertyOptional({ description: 'WhatsApp contact number' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @ApiPropertyOptional({ description: 'Public contact email' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({ description: 'Official website URL' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({ description: 'Facebook page URL' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  facebook?: string;

  @ApiPropertyOptional({ description: 'Instagram profile URL' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  instagram?: string;

  @ApiPropertyOptional({ description: 'Physical address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Market/Area' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  area?: string;

  @ApiPropertyOptional({ description: 'District' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional({ description: 'Upazila' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  upazila?: string;

  @ApiPropertyOptional({ description: 'Union' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  union?: string;

  @ApiPropertyOptional({ description: 'Village' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  village?: string;

  @ApiPropertyOptional({ description: 'Opening hours' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  openingHours?: string;

  @ApiPropertyOptional({ description: 'Delivery details / policies' })
  @IsOptional()
  @IsString()
  deliveryInfo?: string;

  @ApiPropertyOptional({ description: 'Whether the shop is verified by admin' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Whether the shop is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
