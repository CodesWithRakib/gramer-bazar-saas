import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductVariantsService } from './product-variants.service.js';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto.js';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';

@ApiTags('Product Variants (Global Catalog)')
@Controller('product-variants')
export class ProductVariantsController {
  constructor(private readonly productVariantsService: ProductVariantsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new global product variant (Admin only)' })
  create(@Body() createProductVariantDto: CreateProductVariantDto) {
    return this.productVariantsService.create(createProductVariantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all global product variants' })
  findAll() {
    return this.productVariantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a global product variant by ID' })
  findOne(@Param('id') id: string) {
    return this.productVariantsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a global product variant (Admin only)' })
  update(@Param('id') id: string, @Body() updateProductVariantDto: UpdateProductVariantDto) {
    return this.productVariantsService.update(id, updateProductVariantDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a global product variant (Admin only)' })
  remove(@Param('id') id: string) {
    return this.productVariantsService.remove(id);
  }
}
