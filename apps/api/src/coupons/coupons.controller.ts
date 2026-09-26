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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CouponsService } from './coupons.service.js';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { UpdateCouponDto } from './dto/update-coupon.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { ApiStandardResponse, ApiStandardPaginatedResponse, ApiStandardMessageResponse, ApiCommonErrors } from '../common/decorators/api-standard-response.decorator.js';
import { CouponResponseDto, CouponValidationResponseDto, ValidateCouponRequestDto } from './dto/coupon-response.dto.js';

@ApiTags('Coupons')
@Controller()
@ApiCommonErrors()
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('admin/coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Create a new coupon', description: 'Creates a platform or shop-specific coupon with discount constraints and validity dates.' })
  @ApiStandardResponse({ type: CouponResponseDto, status: 201, description: 'Coupon created successfully' })
  create(@Body() createDto: CreateCouponDto) {
    return this.couponsService.create(createDto);
  }

  @Get('admin/coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get all coupons', description: 'Returns a paginated list of all coupons configured in the platform.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search coupons by code' })
  @ApiStandardPaginatedResponse(CouponResponseDto, { description: 'Paginated list of coupons' })
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
  @ApiOperation({ summary: 'Admin: Get a single coupon', description: 'Retrieves complete details for a coupon by ID.' })
  @ApiParam({ name: 'id', description: 'Coupon UUID' })
  @ApiStandardResponse({ type: CouponResponseDto, description: 'Coupon details' })
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Patch('admin/coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update a coupon', description: 'Updates coupon rules, discount values, or status.' })
  @ApiParam({ name: 'id', description: 'Coupon UUID' })
  @ApiStandardResponse({ type: CouponResponseDto, description: 'Coupon updated successfully' })
  update(@Param('id') id: string, @Body() updateDto: UpdateCouponDto) {
    return this.couponsService.update(id, updateDto);
  }

  @Delete('admin/coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Delete a coupon', description: 'Permanently deletes a coupon.' })
  @ApiParam({ name: 'id', description: 'Coupon UUID' })
  @ApiStandardMessageResponse({ description: 'Coupon removed successfully' })
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }

  @Post('seller/coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller: Create a shop coupon', description: 'Creates a discount coupon applicable specifically to the seller shop.' })
  @ApiStandardResponse({ type: CouponResponseDto, status: 201, description: 'Seller coupon created successfully' })
  createSellerCoupon(@Request() req: any, @Body() createDto: CreateCouponDto) {
    return this.couponsService.create({ ...createDto, shopId: req.user.shopId });
  }

  @Get('seller/coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller: Get all shop coupons', description: 'Returns a paginated list of coupons created by the seller shop.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiStandardPaginatedResponse(CouponResponseDto, { description: 'Paginated seller coupons' })
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
  @ApiOperation({ summary: 'Seller: Update a shop coupon', description: 'Updates coupon properties belonging to the seller shop.' })
  @ApiParam({ name: 'id', description: 'Coupon UUID' })
  @ApiStandardResponse({ type: CouponResponseDto, description: 'Seller coupon updated successfully' })
  updateSellerCoupon(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateCouponDto) {
    return this.couponsService.updateSellerCoupon(id, req.user.shopId, updateDto);
  }

  @Delete('seller/coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller: Delete a shop coupon', description: 'Deletes a coupon belonging to the seller shop.' })
  @ApiParam({ name: 'id', description: 'Coupon UUID' })
  @ApiStandardMessageResponse({ description: 'Seller coupon removed successfully' })
  removeSellerCoupon(@Request() req: any, @Param('id') id: string) {
    return this.couponsService.removeSellerCoupon(id, req.user.shopId);
  }

  @Post('coupons/validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer: Validate and preview coupon discount', description: 'Checks coupon validity and calculates discount on the given subtotal before order placement.' })
  @ApiStandardResponse({ type: CouponValidationResponseDto, description: 'Coupon validation result and calculated discount' })
  validateCoupon(
    @Request() req: any,
    @Body() dto: ValidateCouponRequestDto,
  ) {
    return this.couponsService.validateCoupon(dto.code, req.user.id, dto.subtotal);
  }

  @Get('coupons/shop/:shopId')
  @ApiOperation({ summary: 'Public: Get all active coupons for a shop', description: 'Returns all publicly available coupons valid for a particular seller shop.' })
  @ApiParam({ name: 'shopId', description: 'Shop UUID' })
  @ApiStandardResponse({ type: CouponResponseDto, isArray: true, description: 'Active shop coupons' })
  findShopCoupons(@Param('shopId') shopId: string) {
    return this.couponsService.findActiveCouponsByShop(shopId);
  }

  @Get('public/coupons')
  @ApiOperation({ summary: 'Public: Get all active marketplace & platform coupons', description: 'Returns all active platform-wide discount coupons.' })
  @ApiStandardResponse({ type: CouponResponseDto, isArray: true, description: 'Active public coupons' })
  findPublicCoupons() {
    return this.couponsService.findActivePublicCoupons();
  }
}
