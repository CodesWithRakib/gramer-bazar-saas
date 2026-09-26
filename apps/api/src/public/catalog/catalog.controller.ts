import { Controller, Get, Query, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CatalogService } from './catalog.service.js';
import { SearchCatalogDto } from './dto/search-catalog.dto.js';
import { ProductResponseDto } from '../../catalog/dto/product-response.dto.js';
import { BrandResponseDto } from '../../catalog/dto/brand-response.dto.js';
import { CategorySectionResponseDto } from './dto/category-section-response.dto.js';
import {
  ApiStandardResponse,
  ApiStandardPaginatedResponse,
  ApiCommonErrors,
} from '../../common/decorators/api-standard-response.decorator.js';

@ApiTags('Public Catalog')
@Controller('public/catalog')
export class PublicCatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Search and filter storefront catalog products',
    description: 'High-performance customer search supporting fuzzy matching, price ranges, brand/category filters, and sorting.',
  })
  @ApiStandardPaginatedResponse(ProductResponseDto, {
    description: 'Paginated search results',
  })
  @ApiCommonErrors([500])
  search(@Query() searchDto: SearchCatalogDto) {
    return this.catalogService.search(searchDto);
  }

  @Get('featured')
  @ApiOperation({
    summary: 'Retrieve featured showcase products for homepage',
    description: 'Returns active products marked with isFeatured flag.',
  })
  @ApiStandardResponse({
    type: ProductResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of featured products',
  })
  @ApiCommonErrors([500])
  getFeatured() {
    return this.catalogService.getFeatured();
  }

  @Get('popular')
  @ApiOperation({
    summary: 'Retrieve trending / popular products for storefront',
    description: 'Returns top products ordered by customer demand and sales volume.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 8 })
  @ApiStandardResponse({
    type: ProductResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of popular products',
  })
  @ApiCommonErrors([500])
  getPopular(@Query('limit') limit?: string) {
    return this.catalogService.getPopular(limit ? parseInt(limit, 10) : 8);
  }

  @Get('suggestions')
  @ApiOperation({
    summary: 'Real-time search keyword suggestions',
    description: 'Returns autocompletion keywords matching typed input prefix.',
  })
  @ApiQuery({ name: 'q', required: true, type: String, example: 'pota', description: 'Query search prefix' })
  @ApiStandardResponse({
    type: String,
    isArray: true,
    status: HttpStatus.OK,
    description: 'Array of keyword string suggestions',
  })
  @ApiCommonErrors([500])
  getSuggestions(@Query('q') q: string) {
    return this.catalogService.getSuggestions(q);
  }

  @Get('category-sections')
  @ApiOperation({
    summary: 'Homepage category product shelves',
    description: 'Returns curated top categories paired with their leading products for grid displays.',
  })
  @ApiStandardResponse({
    type: CategorySectionResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of category product sections',
  })
  @ApiCommonErrors([500])
  getCategorySections() {
    return this.catalogService.getCategorySections();
  }

  @Get('brands')
  @ApiOperation({
    summary: 'List active storefront brands',
    description: 'Returns all active brand partners for brand sliders and filters.',
  })
  @ApiStandardResponse({
    type: BrandResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of active brands',
  })
  @ApiCommonErrors([500])
  getBrands() {
    return this.catalogService.getBrands();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Retrieve product details by URL slug',
    description: 'Returns complete product information, variant combinations, media assets, and verified reviews.',
  })
  @ApiParam({ name: 'slug', type: String, example: 'organic-red-potato', description: 'Product unique slug' })
  @ApiStandardResponse({
    type: ProductResponseDto,
    status: HttpStatus.OK,
    description: 'Complete product detail record',
  })
  @ApiCommonErrors([404, 500])
  getProductDetails(@Param('slug') slug: string) {
    return this.catalogService.getProductDetails(slug);
  }

  @Get(':slug/related')
  @ApiOperation({
    summary: 'Retrieve related product recommendations',
    description: 'Returns related products sharing same category or brand taxonomy.',
  })
  @ApiParam({ name: 'slug', type: String, example: 'organic-red-potato' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 5 })
  @ApiStandardResponse({
    type: ProductResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'Related product recommendations',
  })
  @ApiCommonErrors([404, 500])
  getRelatedProducts(@Param('slug') slug: string, @Query('limit') limit?: string) {
    return this.catalogService.getRelatedProducts(slug, limit ? parseInt(limit, 10) : 5);
  }
}
