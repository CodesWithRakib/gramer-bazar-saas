import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProductVariantsService } from './product-variants.service.js';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto.js';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto.js';
import { ProductVariantResponseDto } from '../dto/product-response.dto.js';
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

@ApiTags('Catalog - Variants')
@Controller('product-variants')
export class ProductVariantsController {
  constructor(private readonly productVariantsService: ProductVariantsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new global product variant (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Adds SKU variation under master product.',
  })
  @ApiStandardResponse({
    type: ProductVariantResponseDto,
    status: HttpStatus.CREATED,
    description: 'Product variant created successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  create(@Body() createProductVariantDto: CreateProductVariantDto) {
    return this.productVariantsService.create(createProductVariantDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all global product variants',
    description: 'Returns all product variants across master products.',
  })
  @ApiStandardResponse({
    type: ProductVariantResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of product variants',
  })
  @ApiCommonErrors([500])
  findAll() {
    return this.productVariantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve single product variant by UUID',
    description: 'Returns variant pricing, SKU, and image attributes.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Variant UUID' })
  @ApiStandardResponse({
    type: ProductVariantResponseDto,
    status: HttpStatus.OK,
    description: 'Variant details',
  })
  @ApiCommonErrors([404, 500])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productVariantsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a global product variant (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Updates variant pricing, stock, or title.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Variant UUID' })
  @ApiStandardResponse({
    type: ProductVariantResponseDto,
    status: HttpStatus.OK,
    description: 'Variant updated successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
  ) {
    return this.productVariantsService.update(id, updateProductVariantDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a global product variant (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Removes SKU variation.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Variant UUID' })
  @ApiStandardMessageResponse({
    status: HttpStatus.OK,
    description: 'Variant deleted successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productVariantsService.remove(id);
  }
}
