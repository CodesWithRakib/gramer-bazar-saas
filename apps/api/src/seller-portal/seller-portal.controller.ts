import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SellerPortalService } from './seller-portal.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { UpdateSellerShopDto } from './dto/update-seller-shop.dto.js';
import { AddSellerProductDto } from './dto/add-seller-product.dto.js';
import { UpdateSellerProductDto } from './dto/update-seller-product.dto.js';

@ApiTags('Seller Portal')
@Controller('seller-portal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SELLER)
@ApiBearerAuth()
export class SellerPortalController {
  constructor(private readonly sellerPortalService: SellerPortalService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get seller dashboard metrics' })
  getDashboardMetrics(@Request() req: any) {
    return this.sellerPortalService.getDashboardMetrics(req.user.id);
  }

  @Get('shop')
  @ApiOperation({ summary: 'Get current seller shop profile' })
  getShopProfile(@Request() req: any) {
    return this.sellerPortalService.getShopProfile(req.user.id);
  }

  @Patch('shop')
  @ApiOperation({ summary: 'Update current seller shop profile' })
  updateShopProfile(@Request() req: any, @Body() dto: UpdateSellerShopDto) {
    return this.sellerPortalService.updateShopProfile(req.user.id, dto);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get products listed by the seller' })
  getProducts(@Request() req: any, @Query('search') search?: string) {
    return this.sellerPortalService.getProducts(req.user.id, search);
  }

  @Post('products')
  @ApiOperation({ summary: 'Add a product to the seller shop' })
  addProduct(@Request() req: any, @Body() dto: AddSellerProductDto) {
    return this.sellerPortalService.addProduct(req.user.id, dto);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update price and inventory for a seller product' })
  updateProduct(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateSellerProductDto) {
    return this.sellerPortalService.updateProduct(req.user.id, id, dto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get orders containing the seller products' })
  getOrders(@Request() req: any) {
    return this.sellerPortalService.getOrders(req.user.id);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get details for a specific order (filtered to seller items)' })
  getOrderDetails(@Request() req: any, @Param('id') id: string) {
    return this.sellerPortalService.getOrderDetails(req.user.id, id);
  }
}
