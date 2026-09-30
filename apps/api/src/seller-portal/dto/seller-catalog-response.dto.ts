import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SellerCategoryOptionDto {
  @ApiProperty({ description: 'Category UUID' })
  id: string;

  @ApiProperty({ example: 'Fresh Vegetables' })
  nameEn: string;

  @ApiProperty({ example: 'তাজা সবজি' })
  nameBn: string;

  @ApiProperty({ example: 'fresh-vegetables' })
  slug: string;

  @ApiProperty({ type: String, nullable: true, example: '🥬' })
  icon: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Parent category UUID when this is a sub-category',
  })
  parentId?: string | null;
}

export class SellerBrandOptionDto {
  @ApiProperty({ description: 'Brand UUID' })
  id: string;

  @ApiProperty({ example: 'Pran' })
  nameEn: string;

  @ApiProperty({ example: 'প্রাণ' })
  nameBn: string;

  @ApiProperty({ example: 'pran' })
  slug: string;

  @ApiProperty({ type: String, nullable: true })
  logo: string | null;
}
