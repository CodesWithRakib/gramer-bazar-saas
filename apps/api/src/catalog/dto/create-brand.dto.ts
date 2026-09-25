import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ description: 'English name of the brand', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nameEn: string;

  @ApiProperty({ description: 'Bangla name of the brand', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameBn: string;

  @ApiProperty({ description: 'Unique URL slug for the brand' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ description: 'Whether the brand is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Associated category IDs', type: [String] })
  @IsOptional()
  categoryIds?: string[];
}
