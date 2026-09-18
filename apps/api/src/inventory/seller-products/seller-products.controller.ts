import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SellerProductsService } from './seller-products.service.js';
import { CreateSellerProductDto } from '../dto/create-seller-product.dto.js';
import { UpdateSellerProductDto } from '../dto/update-seller-product.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';

@ApiTags('Seller Products (Offers)')
@Controller('seller-products')
export class SellerProductsController {
  constructor(private readonly sellerProductsService: SellerProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new seller product offer' })
  create(@Body() createSellerProductDto: CreateSellerProductDto) {
    return this.sellerProductsService.create(createSellerProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all seller products' })
  findAll() {
    return this.sellerProductsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a seller product by ID' })
  findOne(@Param('id') id: string) {
    return this.sellerProductsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a seller product offer' })
  update(@Param('id') id: string, @Body() updateSellerProductDto: UpdateSellerProductDto) {
    return this.sellerProductsService.update(id, updateSellerProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a seller product offer' })
  remove(@Param('id') id: string) {
    return this.sellerProductsService.remove(id);
  }
}
