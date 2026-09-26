import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Category UUID' })
  id: string;

  @ApiPropertyOptional({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', nullable: true, description: 'Parent category UUID if this is a subcategory' })
  parentId: string | null;

  @ApiProperty({ example: 'Fresh Vegetables', description: 'Category title in English' })
  nameEn: string;

  @ApiProperty({ example: 'তাজা শাকসবজি', description: 'Category title in Bengali' })
  nameBn: string;

  @ApiProperty({ example: 'fresh-vegetables', description: 'Unique category URL slug' })
  slug: string;

  @ApiPropertyOptional({ example: 'carrot', nullable: true, description: 'Icon identifier or SVG' })
  icon: string | null;

  @ApiPropertyOptional({ example: 'https://storage.gramerbazar.com/categories/veg.webp', nullable: true, description: 'Banner/Thumbnail image URL' })
  image: string | null;

  @ApiPropertyOptional({ example: 'Organic farm-fresh local vegetables', nullable: true, description: 'English description' })
  descriptionEn: string | null;

  @ApiPropertyOptional({ example: 'স্থানীয় জৈব তাজা শাকসবজি', nullable: true, description: 'Bengali description' })
  descriptionBn: string | null;

  @ApiProperty({ example: 1, description: 'Display sorting weight' })
  sortOrder: number;

  @ApiProperty({ example: false, description: 'Whether trade in this category requires regulated permits' })
  isRegulated: boolean;

  @ApiProperty({ example: true, description: 'Active marketplace status' })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;

  @ApiPropertyOptional({ example: 42, description: 'Number of active products listed in this category' })
  productCount?: number;

  @ApiPropertyOptional({ type: () => [CategoryResponseDto], description: 'Child subcategories' })
  children?: CategoryResponseDto[];
}
