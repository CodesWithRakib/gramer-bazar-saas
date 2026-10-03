import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductTypesService } from './product-types.service.js';
import {
  CreateProductTypeDto,
  ProductTypeResponseDto,
  UpdateProductTypeDto,
} from '../dto/product-type.dto.js';
import { SetProductTypeAttributesDto } from '../dto/attribute.dto.js';
import {
  ApiStandardResponse,
  ApiStandardMessageResponse,
  ApiCommonErrors,
} from '../../common/decorators/api-standard-response.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';

@ApiTags('Catalog - Product Types')
@Controller(['catalog/product-types', 'product-types'])
export class ProductTypesController {
  constructor(private readonly productTypesService: ProductTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Permissions('categories.create')
  @ApiOperation({ summary: 'Create a catalog product type (Admin only)' })
  @ApiStandardResponse({
    type: ProductTypeResponseDto,
    status: HttpStatus.CREATED,
    description: 'Product type created successfully',
  })
  @ApiCommonErrors([400, 401, 403, 409, 500])
  create(@Body() dto: CreateProductTypeDto) {
    return this.productTypesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List catalog product types' })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({
    name: 'categoryPath',
    required: false,
    type: String,
    description: 'Materialized category path, e.g. electronics/computers-pc',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'includeMappings', required: false, type: Boolean })
  @ApiStandardResponse({
    type: ProductTypeResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'Product type list',
  })
  @ApiCommonErrors([500])
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('categoryPath') categoryPath?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('includeMappings') includeMappings?: string,
  ) {
    return this.productTypesService.findAll({
      categoryId,
      categoryPath,
      search,
      isActive: isActive === undefined ? undefined : isActive === 'true',
      includeMappings: includeMappings === 'true',
    });
  }

  @Get('facets')
  @ApiOperation({
    summary: 'Dynamic filter facets for a category or product type',
    description:
      'Returns filter groups, option counts, brand facets and price range derived from the product type attribute schema.',
  })
  @ApiStandardResponse({ status: HttpStatus.OK, description: 'Facet groups and counts' })
  @ApiCommonErrors([400, 500])
  getFacets(
    @Query('categoryId') categoryId?: string,
    @Query('categoryPath') categoryPath?: string,
    @Query('productTypeId') productTypeId?: string,
    @Query('brandId') brandId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('inStock') inStock?: string,
    @Query('attributes') attributes?: string,
  ) {
    return this.productTypesService.getFacets({
      categoryId,
      categoryPath,
      productTypeId,
      brandId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock: inStock === 'true',
      attributeFilters: attributes ? (JSON.parse(attributes) as Record<string, string[]>) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a product type with its attribute mappings' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiStandardResponse({
    type: ProductTypeResponseDto,
    status: HttpStatus.OK,
    description: 'Product type details',
  })
  @ApiCommonErrors([404, 500])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productTypesService.findOne(id);
  }

  @Get(':id/attributes')
  @ApiOperation({ summary: 'List attribute mappings for a product type' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiStandardResponse({ status: HttpStatus.OK, description: 'Attribute mappings' })
  @ApiCommonErrors([404, 500])
  getAttributes(@Param('id', ParseUUIDPipe) id: string) {
    return this.productTypesService.getMappings(id);
  }

  @Put(':id/attributes')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Permissions('categories.update')
  @ApiOperation({ summary: 'Replace the attribute schema for a product type (Admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiStandardResponse({ status: HttpStatus.OK, description: 'Updated attribute mappings' })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  setAttributes(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SetProductTypeAttributesDto) {
    return this.productTypesService.setMappings(id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Permissions('categories.update')
  @ApiOperation({ summary: 'Update a catalog product type (Admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiStandardResponse({
    type: ProductTypeResponseDto,
    status: HttpStatus.OK,
    description: 'Product type updated successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 409, 500])
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductTypeDto) {
    return this.productTypesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Permissions('categories.delete')
  @ApiOperation({ summary: 'Delete a catalog product type (Admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiStandardMessageResponse({
    status: HttpStatus.OK,
    description: 'Product type deleted successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productTypesService.remove(id);
  }

}
