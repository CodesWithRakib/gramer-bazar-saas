import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { SellerPortalService } from './seller-portal.service.js';
import { SupabaseStorageService } from '../storage/supabase-storage.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { UpdateSellerShopDto } from './dto/update-seller-shop.dto.js';
import { AddSellerProductDto } from './dto/add-seller-product.dto.js';
import { UpdateSellerProductDto } from './dto/update-seller-product.dto.js';
import { ApiStandardResponse, ApiCommonErrors } from '../common/decorators/api-standard-response.decorator.js';
import { SellerDashboardResponseDto } from './dto/seller-dashboard-response.dto.js';
import { ShopResponseDto } from '../shops/dto/shop-response.dto.js';
import { SellerProductResponseDto } from '../inventory/dto/seller-product-response.dto.js';
import { OrderResponseDto } from '../orders/dto/order-response.dto.js';

@ApiTags('Seller Portal')
@Controller('seller-portal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SELLER)
@ApiBearerAuth()
@ApiCommonErrors()
export class SellerPortalController {
  constructor(
    private readonly sellerPortalService: SellerPortalService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get seller dashboard metrics', description: 'Returns aggregate analytics, low stock alerts, active orders, and sales trends for the seller.' })
  @ApiStandardResponse({ type: SellerDashboardResponseDto, description: 'Seller dashboard metrics retrieved' })
  getDashboardMetrics(@Request() req: any) {
    return this.sellerPortalService.getDashboardMetrics(req.user.id);
  }

  @Get('shop')
  @ApiOperation({ summary: 'Get current seller shop profile', description: 'Returns details and settings of the shop associated with the authenticated seller.' })
  @ApiStandardResponse({ type: ShopResponseDto, description: 'Seller shop profile retrieved' })
  getShopProfile(@Request() req: any) {
    return this.sellerPortalService.getShopProfile(req.user.id);
  }

  @Patch('shop')
  @ApiOperation({ summary: 'Update current seller shop profile', description: 'Updates profile metadata such as shop name, description, phone, or address.' })
  @ApiStandardResponse({ type: ShopResponseDto, description: 'Seller shop updated successfully' })
  updateShopProfile(@Request() req: any, @Body() dto: UpdateSellerShopDto) {
    return this.sellerPortalService.updateShopProfile(req.user.id, dto);
  }

  @Post('shop/logo')
  @ApiOperation({ summary: 'Upload shop logo', description: 'Uploads and updates the shop logo image in cloud storage.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Shop logo image file (JPEG, PNG, WEBP, max 5MB)' },
      },
      required: ['file'],
    },
  })
  @ApiStandardResponse({ type: ShopResponseDto, description: 'Shop logo uploaded and profile updated' })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadShopLogo(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    const shop = await this.sellerPortalService.getShopProfile(req.user.id);
    const validation = this.storageService.validateImage(file.buffer, file.mimetype);
    const storagePath = this.storageService.getShopImagePath(shop.id, 'profile', validation.ext);
    const result = await this.storageService.replaceImage(shop.logo, storagePath, file.buffer, validation.mimeType);
    return this.sellerPortalService.updateShopProfile(req.user.id, { logo: result.publicUrl });
  }

  @Post('shop/banner')
  @ApiOperation({ summary: 'Upload shop cover banner', description: 'Uploads and updates the shop cover banner image in cloud storage.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Shop banner image file (JPEG, PNG, WEBP, max 5MB)' },
      },
      required: ['file'],
    },
  })
  @ApiStandardResponse({ type: ShopResponseDto, description: 'Shop banner uploaded and profile updated' })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadShopBanner(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    const shop = await this.sellerPortalService.getShopProfile(req.user.id);
    const validation = this.storageService.validateImage(file.buffer, file.mimetype);
    const storagePath = this.storageService.getShopImagePath(shop.id, 'cover', validation.ext);
    const result = await this.storageService.replaceImage(shop.banner, storagePath, file.buffer, validation.mimeType);
    return this.sellerPortalService.updateShopProfile(req.user.id, { banner: result.publicUrl });
  }

  @Get('products')
  @ApiOperation({ summary: 'Get products listed by the seller', description: 'Returns inventory list of seller products with variant and stock information.' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search products by name or SKU' })
  @ApiStandardResponse({ type: SellerProductResponseDto, isArray: true, description: 'List of products listed by seller' })
  getProducts(@Request() req: any, @Query('search') search?: string) {
    return this.sellerPortalService.getProducts(req.user.id, search);
  }

  @Post('products')
  @ApiOperation({ summary: 'Add a product to the seller shop', description: 'Links a catalog product variant to the seller shop with custom pricing and stock.' })
  @ApiStandardResponse({ type: SellerProductResponseDto, status: 201, description: 'Product added to seller shop successfully' })
  addProduct(@Request() req: any, @Body() dto: AddSellerProductDto) {
    return this.sellerPortalService.addProduct(req.user.id, dto);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update price and inventory for a seller product', description: 'Modifies pricing, stock quantities, or active status of a seller listing.' })
  @ApiParam({ name: 'id', description: 'Seller product UUID' })
  @ApiStandardResponse({ type: SellerProductResponseDto, description: 'Seller product updated successfully' })
  updateProduct(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateSellerProductDto) {
    return this.sellerPortalService.updateProduct(req.user.id, id, dto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get orders containing the seller products', description: 'Lists all customer orders containing items from this seller shop.' })
  @ApiStandardResponse({ type: OrderResponseDto, isArray: true, description: 'List of seller orders' })
  getOrders(@Request() req: any) {
    return this.sellerPortalService.getOrders(req.user.id);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get details for a specific order', description: 'Returns order details filtered specifically to this seller items with seller subtotal.' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiStandardResponse({ type: OrderResponseDto, description: 'Seller order details' })
  getOrderDetails(@Request() req: any, @Param('id') id: string) {
    return this.sellerPortalService.getOrderDetails(req.user.id, id);
  }
}
