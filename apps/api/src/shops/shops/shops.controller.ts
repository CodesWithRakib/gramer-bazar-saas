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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShopsService } from './shops.service.js';
import { CreateShopDto } from '../dto/create-shop.dto.js';
import { UpdateShopDto } from '../dto/update-shop.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';

@ApiTags('Shops (Seller Profiles)')
@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new shop' })
  create(@Body() createShopDto: CreateShopDto, @Request() req: any) {
    // If it's a seller, force the sellerId to their own ID.
    // If it's an admin, they can specify the sellerId.
    if (
      !req.user.roles?.includes(Role.ADMIN) &&
      !req.user.roles?.includes(Role.SUPER_ADMIN)
    ) {
      createShopDto.sellerId = req.user.id;
    }
    return this.shopsService.create(createShopDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shops' })
  findAll() {
    return this.shopsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a shop by ID or slug' })
  findOne(@Param('id') id: string) {
    return this.shopsService.findOne(id);
  }

  @Get(':id/products')
  @ApiOperation({
    summary:
      'Get paginated products for a shop with filters and category breakdown',
  })
  getShopProducts(@Param('id') id: string, @Request() req: any) {
    const query = req.query || {};
    return this.shopsService.getShopProducts(id, {
      categoryId: query.categoryId,
      categorySlug: query.categorySlug,
      subCategoryId: query.subCategoryId,
      brandId: query.brandId,
      search: query.search || query.q,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      inStock: query.inStock === 'true' ? true : undefined,
      minRating: query.minRating ? Number(query.minRating) : undefined,
      sort: query.sort,
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 20,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a shop' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a shop (Admin only)' })
  remove(@Param('id') id: string) {
    return this.shopsService.remove(id);
  }
}
