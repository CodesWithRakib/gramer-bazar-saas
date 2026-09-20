import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service.js';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { UpdateCouponDto } from './dto/update-coupon.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';

@ApiTags('Coupons')
@Controller()
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('admin/coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Create a new coupon' })
  create(@Body() createDto: CreateCouponDto) {
    return this.couponsService.create(createDto);
  }

  @Get('admin/coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get all coupons' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.couponsService.findAll(page, limit, search);
  }

  @Get('admin/coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get a single coupon' })
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Patch('admin/coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update a coupon' })
  update(@Param('id') id: string, @Body() updateDto: UpdateCouponDto) {
    return this.couponsService.update(id, updateDto);
  }

  @Delete('admin/coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Delete a coupon' })
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }

  @Post('seller/coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller: Create a shop coupon' })
  createSellerCoupon(@Request() req: any, @Body() createDto: CreateCouponDto) {
    // Assuming shopId is fetched from the seller's profile
    return this.couponsService.create({ ...createDto, shopId: req.user.shopId });
  }

  @Get('seller/coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller: Get all shop coupons' })
  findAllSellerCoupons(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.couponsService.findAll(page, limit, search, req.user.shopId);
  }

  @Patch('seller/coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller: Update a shop coupon' })
  updateSellerCoupon(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateCouponDto) {
    // Ideally add logic in service to check if the coupon belongs to this seller's shop
    return this.couponsService.updateSellerCoupon(id, req.user.shopId, updateDto);
  }

  @Delete('seller/coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller: Delete a shop coupon' })
  removeSellerCoupon(@Request() req: any, @Param('id') id: string) {
    return this.couponsService.removeSellerCoupon(id, req.user.shopId);
  }

  @Post('coupons/validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer: Validate and preview coupon discount' })
  validateCoupon(
    @Request() req: any,
    @Body('code') code: string,
    @Body('subtotal') subtotal: number,
  ) {
    return this.couponsService.validateCoupon(code, req.user.id, subtotal);
  }

  @Get('coupons/shop/:shopId')
  @ApiOperation({ summary: 'Public: Get all active coupons for a shop' })
  findShopCoupons(@Param('shopId') shopId: string) {
    return this.couponsService.findActiveCouponsByShop(shopId);
  }
}
