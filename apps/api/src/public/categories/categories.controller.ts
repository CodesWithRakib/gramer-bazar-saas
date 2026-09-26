import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { CategoryResponseDto } from '../../catalog/dto/category-response.dto.js';
import {
  ApiStandardResponse,
  ApiCommonErrors,
} from '../../common/decorators/api-standard-response.decorator.js';

@ApiTags('Public Categories')
@Controller('public/categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('tree')
  @ApiOperation({
    summary: 'Retrieve active storefront category hierarchy',
    description: 'Returns category hierarchy with nested subcategories and active product counts.',
  })
  @ApiStandardResponse({
    type: CategoryResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'Hierarchical category tree for storefront navigation',
  })
  @ApiCommonErrors([500])
  getTree() {
    return this.categoriesService.getTree();
  }

  @Get()
  @ApiOperation({
    summary: 'List all active categories for storefront',
    description: 'Returns flat list of all active categories available for product discovery.',
  })
  @ApiStandardResponse({
    type: CategoryResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of active categories',
  })
  @ApiCommonErrors([500])
  findAll() {
    return this.categoriesService.findAllActive();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Retrieve active category by slug',
    description: 'Returns category details matching URL slug.',
  })
  @ApiParam({ name: 'slug', type: String, example: 'fresh-vegetables' })
  @ApiStandardResponse({
    type: CategoryResponseDto,
    status: HttpStatus.OK,
    description: 'Category details',
  })
  @ApiCommonErrors([404, 500])
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }
}
