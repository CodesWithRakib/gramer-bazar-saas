import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from '../../../catalog/dto/category-response.dto.js';
import { CategorySectionResponseDto } from './category-section-response.dto.js';
import { ShopResponseDto } from '../../../shops/dto/shop-response.dto.js';

export class HomepageResponseDto {
  @ApiProperty({
    type: [CategoryResponseDto],
    description: 'Top root categories for discovery',
  })
  categories: CategoryResponseDto[];

  @ApiProperty({
    type: [Object],
    description: 'Curated featured marketplace products',
  })
  featuredProducts: any[];

  @ApiProperty({ type: [Object], description: 'Top demand popular products' })
  popularProducts: any[];

  @ApiProperty({
    type: [ShopResponseDto],
    description: 'Featured verified local vendor shops',
  })
  featuredShops: ShopResponseDto[];

  @ApiProperty({
    type: [Object],
    description: 'Active promotional campaigns and flash sales',
  })
  offers: any[];

  @ApiProperty({
    type: [CategorySectionResponseDto],
    description: 'Independent category shelves',
  })
  categorySections: CategorySectionResponseDto[];

  @ApiProperty({
    type: [Object],
    description: 'Recently added marketplace products',
  })
  recentlyAdded: any[];
}
