import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from '../../../catalog/dto/category-response.dto.js';
import { ProductResponseDto } from '../../../catalog/dto/product-response.dto.js';

export class CategorySectionResponseDto {
  @ApiProperty({ type: CategoryResponseDto, description: 'Category metadata' })
  category: CategoryResponseDto;

  @ApiProperty({ type: [ProductResponseDto], description: 'Top curated products belonging to this category' })
  products: ProductResponseDto[];
}
