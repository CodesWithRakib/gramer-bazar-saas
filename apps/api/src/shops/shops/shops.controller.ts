import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ShopsService } from './shops.service.js';
import { CreateShopDto } from '../dto/create-shop.dto.js';
import { UpdateShopDto } from '../dto/update-shop.dto.js';
import { ShopResponseDto } from '../dto/shop-response.dto.js';
import { ShopProductsResponseDto } from '../../inventory/dto/seller-product-response.dto.js';
import { MessageResponseDto } from '../../common/dto/api-response.dto.js';
import {
  ApiStandardResponse,
  ApiStandardMessageResponse,
  ApiCommonErrors,
} from '../../common/decorators/api-standard-response.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';

@ApiTags('Shops')
@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Register a new vendor store / shop profile',
    description: 'Requires SELLER, ADMIN, or SUPER_ADMIN role. Sellers can register their own shop; Admins can register shops on behalf of any sellerId.',
  })
  @ApiStandardResponse({
    type: ShopResponseDto,
    status: HttpStatus.CREATED,
    description: 'Shop profile created successfully',
  })
  @ApiCommonErrors([400, 401, 403, 409, 500])
  create(@Body() createShopDto: CreateShopDto, @Request() req: any) {
    if (
      !req.user.roles?.includes(Role.ADMIN) &&
      !req.user.roles?.includes(Role.SUPER_ADMIN)
    ) {
      createShopDto.sellerId = req.user.id;
    }
    return this.shopsService.create(createShopDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all verified marketplace shops',
    description: 'Returns active vendor shops with geographical location metadata.',
  })
  @ApiStandardResponse({
    type: ShopResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of vendor shops',
  })
  @ApiCommonErrors([500])
  findAll() {
    return this.shopsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve vendor shop profile by UUID or slug',
    description: 'Returns shop details, business hours, contacts, and delivery info.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Shop UUID or unique URL slug' })
  @ApiStandardResponse({
    type: ShopResponseDto,
    status: HttpStatus.OK,
    description: 'Shop details',
  })
  @ApiCommonErrors([404, 500])
  findOne(@Param('id') id: string) {
    return this.shopsService.findOne(id);
  }

  @Get(':id/products')
  @ApiOperation({
    summary: 'Get paginated products for a shop with filters and category breakdown',
    description: 'Returns shop catalog products with category facet breakdown.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Shop UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'categorySlug', required: false, type: String })
  @ApiQuery({ name: 'brandId', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'inStock', required: false, type: Boolean })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiStandardResponse({
    type: ShopProductsResponseDto,
    status: HttpStatus.OK,
    description: 'Shop catalog products with category facets',
  })
  @ApiCommonErrors([404, 500])
  getShopProducts(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('subCategoryId') subCategoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('inStock') inStock?: boolean,
    @Query('minRating') minRating?: number,
    @Query('sort') sort?: string,
  ) {
    return this.shopsService.getShopProducts(id, {
      categoryId,
      categorySlug,
      subCategoryId,
      brandId,
      search,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock: inStock !== undefined ? String(inStock) === 'true' : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      sort,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update shop profile details',
    description: 'Requires shop owner or ADMIN role. Modifies contact numbers, logos, banners, or address.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Shop UUID' })
  @ApiStandardResponse({
    type: ShopResponseDto,
    status: HttpStatus.OK,
    description: 'Shop profile updated successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  async update(
    @Param('id') id: string,
    @Body() updateShopDto: UpdateShopDto,
    @Request() req: any,
  ) {
    const isAdmin =
      req.user.roles?.includes(Role.ADMIN) ||
      req.user.roles?.includes(Role.SUPER_ADMIN);
    if (!isAdmin) {
      const existing = await this.shopsService.findOne(id);
      if (existing.sellerId !== req.user.id) {
        throw new NotFoundException(
          'You do not have permission to modify this shop',
        );
      }
    }
    return this.shopsService.update(id, updateShopDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a shop profile (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Removes vendor store from platform.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Shop UUID' })
  @ApiStandardMessageResponse({
    status: HttpStatus.OK,
    description: 'Shop deleted successfully',
  })
  @ApiCommonErrors([401, 403, 404, 500])
  remove(@Param('id') id: string) {
    return this.shopsService.remove(id);
  }
}
