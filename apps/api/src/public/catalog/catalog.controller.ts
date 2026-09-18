import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CatalogService } from './catalog.service.js';
import { SearchCatalogDto } from './dto/search-catalog.dto.js';

@ApiTags('Public / Catalog')
@Controller('public/catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search and filter products for storefront' })
  search(@Query() searchDto: SearchCatalogDto) {
    return this.catalogService.search(searchDto);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products for homepage' })
  getFeatured() {
    return this.catalogService.getFeatured();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product details by slug' })
  getProductDetails(@Param('slug') slug: string) {
    return this.catalogService.getProductDetails(slug);
  }

  @Get(':slug/related')
  @ApiOperation({ summary: 'Get related products' })
  getRelatedProducts(@Param('slug') slug: string, @Query('limit') limit?: string) {
    return this.catalogService.getRelatedProducts(slug, limit ? parseInt(limit, 10) : 5);
  }
}
