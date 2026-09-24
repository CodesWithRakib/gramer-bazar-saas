import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';

@ApiTags('Public / Categories')
@Controller('public/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('tree')
  @ApiOperation({ summary: 'Get active category tree with subcategories' })
  getTree() {
    return this.categoriesService.getTree();
  }

  @Get()
  @ApiOperation({ summary: 'Get all active categories for storefront' })
  findAll() {
    return this.categoriesService.findAllActive();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get active category by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }
}
