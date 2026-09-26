import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { SellerPortalService } from './seller-portal.service.js';
import { SupabaseStorageService } from '../storage/supabase-storage.service.js';
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
  constructor(
    private readonly sellerPortalService: SellerPortalService,
    private readonly storageService: SupabaseStorageService,
  ) {}

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

  @Post('shop/logo')
  @ApiOperation({ summary: 'Upload shop logo' })
  @ApiConsumes('multipart/form-data')
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
  @ApiOperation({ summary: 'Upload shop cover banner' })
  @ApiConsumes('multipart/form-data')
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
