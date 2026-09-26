import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryResponseDto } from './category-response.dto.js';

export class BrandResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Brand UUID' })
  id: string;

  @ApiProperty({ example: 'Pran', description: 'Brand name in English' })
  nameEn: string;

  @ApiProperty({ example: 'প্রাণ', description: 'Brand name in Bengali' })
  nameBn: string;

  @ApiProperty({ example: 'pran', description: 'Unique brand URL slug' })
  slug: string;

  @ApiPropertyOptional({ example: 'https://storage.gramerbazar.com/brands/pran.png', nullable: true, description: 'Brand logo image URL' })
  logo: string | null;

  @ApiProperty({ example: true, description: 'Whether the brand is active' })
  isActive: boolean;

  @ApiPropertyOptional({ type: () => [CategoryResponseDto], description: 'Categories associated with this brand' })
  categories?: CategoryResponseDto[];

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}
