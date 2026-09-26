import {
  Controller,
  Get,
  Post,
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
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
import { UpdateCategoryDto } from '../dto/update-category.dto.js';
import { CategoryResponseDto } from '../dto/category-response.dto.js';
import { MessageResponseDto } from '../../common/dto/api-response.dto.js';
import {
  ApiStandardResponse,
  ApiStandardPaginatedResponse,
  ApiStandardMessageResponse,
  ApiCommonErrors,
} from '../../common/decorators/api-standard-response.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';

@ApiTags('Catalog - Categories')
@Controller('catalog/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new catalog category (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Creates a top-level category or nested subcategory.',
  })
  @ApiStandardResponse({
    type: CategoryResponseDto,
    status: HttpStatus.CREATED,
    description: 'Category created successfully',
  })
  @ApiCommonErrors([400, 401, 403, 409, 500])
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get('tree')
  @ApiOperation({
    summary: 'Retrieve complete hierarchical category tree',
    description: 'Returns top-level categories nested with their children/subcategories for navigation trees.',
  })
  @ApiStandardResponse({
    type: CategoryResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'Hierarchical category tree',
  })
  @ApiCommonErrors([500])
  getTree() {
    return this.categoriesService.getTree();
  }

  @Get()
  @ApiOperation({
    summary: 'List categories with optional filters',
    description: 'Returns categories matching pagination, search term, parentId, or rootsOnly flag.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'Vegetable' })
  @ApiQuery({ name: 'parentId', required: false, type: String, description: 'Filter subcategories of parent UUID' })
  @ApiQuery({ name: 'rootsOnly', required: false, type: Boolean, description: 'Only return root level categories' })
  @ApiStandardPaginatedResponse(CategoryResponseDto, {
    description: 'Paginated or filtered category list',
  })
  @ApiCommonErrors([500])
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('parentId') parentId?: string,
    @Query('rootsOnly') rootsOnly?: boolean,
  ) {
    return this.categoriesService.findAll(page, limit, search, parentId, rootsOnly);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve single category by UUID',
    description: 'Returns full category details, child subcategories, and associated brands.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Category UUID' })
  @ApiStandardResponse({
    type: CategoryResponseDto,
    status: HttpStatus.OK,
    description: 'Category details',
  })
  @ApiCommonErrors([404, 500])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update category details (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Modifies category titles, icons, images, sorting, or regulatory flag.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Category UUID' })
  @ApiStandardResponse({
    type: CategoryResponseDto,
    status: HttpStatus.OK,
    description: 'Category updated successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a category (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Deletes category if no products are associated.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Category UUID' })
  @ApiStandardMessageResponse({
    status: HttpStatus.OK,
    description: 'Category deleted successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
