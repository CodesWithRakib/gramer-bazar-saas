import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateIngredientDto {
  @ApiProperty({ example: 'Paracetamol' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nameEn: string;

  @ApiProperty({ example: 'প্যারাসিটামল' })
  @IsString()
  @MinLength(2)
  @MaxLength(250)
  nameBn: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPrescriptionOnly?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateIngredientDto extends PartialType(CreateIngredientDto) {}

export class IngredientResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'Paracetamol' })
  nameEn: string;

  @ApiProperty({ example: 'প্যারাসিটামল' })
  nameBn: string;

  @ApiProperty({ example: 'paracetamol' })
  slug: string;

  @ApiProperty({ example: false })
  isPrescriptionOnly: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-10-03T09:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-03T09:00:00.000Z' })
  updatedAt: Date;
}
