import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SellerProductsService } from './seller-products.service.js';
import { CreateSellerProductDto } from '../dto/create-seller-product.dto.js';
import { UpdateSellerProductDto } from '../dto/update-seller-product.dto.js';
import { SellerProductResponseDto } from '../dto/seller-product-response.dto.js';
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

@ApiTags('Inventory - Seller Products')
@Controller('inventory/seller-products')
export class SellerProductsController {
  constructor(private readonly sellerProductsService: SellerProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new seller product listing offer',
    description: 'Requires SELLER, ADMIN, or SUPER_ADMIN role. Links seller store to master product variant with custom price and initial stock.',
  })
  @ApiStandardResponse({
    type: SellerProductResponseDto,
    status: HttpStatus.CREATED,
    description: 'Seller product listing created successfully',
  })
  @ApiCommonErrors([400, 401, 403, 409, 500])
  create(@Body() createSellerProductDto: CreateSellerProductDto) {
    return this.sellerProductsService.create(createSellerProductDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  @ApiOperation({
    summary: 'List all active seller product listings',
    description: 'Cached for 60s. Returns active vendor product offers linked to master variants.',
  })
  @ApiStandardResponse({
    type: SellerProductResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of seller product offers',
  })
  @ApiCommonErrors([500])
  findAll() {
    return this.sellerProductsService.findAll();
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  @ApiOperation({
    summary: 'Retrieve single seller product offer by UUID',
    description: 'Cached for 60s. Returns vendor product listing details with inventory quantities.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'SellerProduct UUID' })
  @ApiStandardResponse({
    type: SellerProductResponseDto,
    status: HttpStatus.OK,
    description: 'Seller product details',
  })
  @ApiCommonErrors([404, 500])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sellerProductsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a seller product offer',
    description: 'Requires owner SELLER or ADMIN role. Updates price, discount, or SKU.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'SellerProduct UUID' })
  @ApiStandardResponse({
    type: SellerProductResponseDto,
    status: HttpStatus.OK,
    description: 'Seller product updated successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSellerProductDto: UpdateSellerProductDto,
  ) {
    return this.sellerProductsService.update(id, updateSellerProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a seller product offer',
    description: 'Requires owner SELLER or ADMIN role. Removes merchant product listing and associated inventory.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'SellerProduct UUID' })
  @ApiStandardMessageResponse({
    status: HttpStatus.OK,
    description: 'Seller product deleted successfully',
  })
  @ApiCommonErrors([401, 403, 404, 500])
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sellerProductsService.remove(id);
  }
}
