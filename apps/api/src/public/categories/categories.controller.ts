import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';

@ApiTags('Public / Categories')
@Controller('public/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active categories for storefront' })
  findAll() {
    return this.categoriesService.findAllActive();
  }
}
