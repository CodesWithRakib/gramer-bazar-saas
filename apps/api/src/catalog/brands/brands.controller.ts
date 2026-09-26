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
import { BrandsService } from './brands.service.js';
import { CreateBrandDto } from '../dto/create-brand.dto.js';
import { UpdateBrandDto } from '../dto/update-brand.dto.js';
import { BrandResponseDto } from '../dto/brand-response.dto.js';
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

@ApiTags('Catalog - Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Register a new brand in the catalog (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Creates brand and associates with target categories.',
  })
  @ApiStandardResponse({
    type: BrandResponseDto,
    status: HttpStatus.CREATED,
    description: 'Brand registered successfully',
  })
  @ApiCommonErrors([400, 401, 403, 409, 500])
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all brands with pagination and category filtering',
    description: 'Retrieves brand directory filtered by keyword search, category, or active status.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'Pran' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Category UUID filter' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiStandardPaginatedResponse(BrandResponseDto, {
    description: 'Paginated brand list',
  })
  @ApiCommonErrors([500])
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.brandsService.findAll(page, limit, search, categoryId, isActive);
  }

  @Get('by-category/:categoryId')
  @ApiOperation({
    summary: 'List active brands affiliated with a specific category',
    description: 'Returns brands associated with the selected category UUID for dropdown selectors.',
  })
  @ApiParam({ name: 'categoryId', type: String, format: 'uuid', description: 'Category UUID' })
  @ApiStandardResponse({
    type: BrandResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of affiliated brands',
  })
  @ApiCommonErrors([404, 500])
  findByCategory(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
    return this.brandsService.findByCategory(categoryId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve single brand by UUID',
    description: 'Returns complete brand record with category associations.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Brand UUID' })
  @ApiStandardResponse({
    type: BrandResponseDto,
    status: HttpStatus.OK,
    description: 'Brand details',
  })
  @ApiCommonErrors([404, 500])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update brand details (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Updates name, slug, logo URL, or category links.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Brand UUID' })
  @ApiStandardResponse({
    type: BrandResponseDto,
    status: HttpStatus.OK,
    description: 'Brand updated successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a brand (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Removes brand from directory.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Brand UUID' })
  @ApiStandardMessageResponse({
    status: HttpStatus.OK,
    description: 'Brand deleted successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandsService.remove(id);
  }
}
