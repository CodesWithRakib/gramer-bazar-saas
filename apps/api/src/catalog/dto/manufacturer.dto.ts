import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateManufacturerDto {
  @ApiProperty({ example: 'Beximco Pharmaceuticals Ltd.' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nameEn: string;

  @ApiProperty({ example: 'বেক্সিমকো ফার্মাসিউটিক্যালস' })
  @IsString()
  @MinLength(2)
  @MaxLength(250)
  nameBn: string;

  @ApiPropertyOptional({ example: 'Bangladesh' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logos/beximco.png' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo?: string;

  @ApiPropertyOptional({ example: 'https://www.beximco-pharma.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateManufacturerDto extends PartialType(CreateManufacturerDto) {}

export class ManufacturerResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'Beximco Pharmaceuticals Ltd.' })
  nameEn: string;

  @ApiProperty({ example: 'বেক্সিমকো ফার্মাসিউটিক্যালস' })
  nameBn: string;

  @ApiProperty({ example: 'beximco-pharmaceuticals-ltd' })
  slug: string;

  @ApiPropertyOptional({ example: 'Bangladesh', nullable: true })
  country: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  logo: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  website: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-10-03T09:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-03T09:00:00.000Z' })
  updatedAt: Date;
}
