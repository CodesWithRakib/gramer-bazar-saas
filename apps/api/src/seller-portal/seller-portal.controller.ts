import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UploadedFiles,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { SellerPortalService } from './seller-portal.service.js';
import { SellerProductsService } from './seller-products.service.js';
import { SellerAnalyticsService } from './seller-analytics.service.js';
import { SellerReviewsService } from './seller-reviews.service.js';
import { SupabaseStorageService } from '../storage/supabase-storage.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { UpdateSellerShopDto } from './dto/update-seller-shop.dto.js';
import { CreateSellerProductDto } from './dto/create-seller-product.dto.js';
import { UpdateSellerProductDto } from './dto/update-seller-product.dto.js';
import { ReorderImagesDto } from '../catalog/dto/reorder-images.dto.js';
import { BulkStockUpdateDto } from './dto/bulk-stock-update.dto.js';
import { TransitionOrderDto } from '../orders/dto/transition-order.dto.js';
import {
  SellerOrderQueryDto,
  SellerProductQueryDto,
  SellerReviewQueryDto,
} from './dto/seller-query.dto.js';
import {
  ApiStandardResponse,
  ApiCommonErrors,
} from '../common/decorators/api-standard-response.decorator.js';
import { SellerDashboardResponseDto } from './dto/seller-dashboard-response.dto.js';
import { SellerAnalyticsResponseDto } from './dto/seller-analytics.dto.js';
import { ShopResponseDto } from '../shops/dto/shop-response.dto.js';
import { SellerProductDetailDto, SellerProductListDto } from './dto/seller-product-response.dto.js';
import { SellerOrderDetailDto, SellerOrderListDto } from './dto/seller-order-response.dto.js';
import {
  ReplyToReviewDto,
  SellerReviewItemDto,
  SellerReviewListDto,
  SellerReviewSummaryDto,
} from './dto/seller-review.dto.js';
import type { AuthenticatedRequest } from '../common/types/authenticated-request.js';
import {
  SellerBrandOptionDto,
  SellerCategoryOptionDto,
} from './dto/seller-catalog-response.dto.js';
import { BulkStockUpdateResultDto } from './dto/bulk-stock-update.dto.js';

const MAX_IMAGE_UPLOAD_BYTES = SupabaseStorageService.MAX_FILE_SIZE_BYTES;

@ApiTags('Seller Portal')
@Controller('seller-portal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SELLER)
@ApiBearerAuth('JWT-auth')
@ApiCommonErrors()
export class SellerPortalController {
  constructor(
    private readonly sellerPortalService: SellerPortalService,
    private readonly sellerProductsService: SellerProductsService,
    private readonly sellerAnalyticsService: SellerAnalyticsService,
    private readonly sellerReviewsService: SellerReviewsService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  // -------------------------------------------------------------- dashboard

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get seller dashboard metrics',
    description:
      'Returns live business metrics for the authenticated seller: settled sales, order pipeline, inventory health, promotions, wallet snapshot, recent orders and best sellers.',
  })
  @ApiStandardResponse({
    type: SellerDashboardResponseDto,
    description: 'Seller dashboard metrics retrieved',
  })
  getDashboardMetrics(@Request() req: AuthenticatedRequest) {
    return this.sellerPortalService.getDashboardMetrics(req.user.id);
  }

  @Get('analytics')
  @ApiOperation({
    summary: 'Get seller sales analytics',
    description:
      'Returns settled revenue by period, order funnel, inventory valuation, best sellers, revenue by category and a daily revenue trend. All figures are aggregated server-side from real order data.',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    example: 30,
    description: 'Trend window in days (7-90)',
  })
  @ApiStandardResponse({
    type: SellerAnalyticsResponseDto,
    description: 'Seller analytics retrieved',
  })
  getAnalytics(@Request() req: AuthenticatedRequest, @Query('days') days?: number) {
    const parsed = Number(days);
    const window = Number.isFinite(parsed) ? parsed : 30;
    return this.sellerAnalyticsService.getAnalytics(req.user.id, window);
  }

  // ------------------------------------------------------------------- shop

  @Get('shop')
  @ApiOperation({
    summary: 'Get current seller shop profile',
    description:
      'Returns the shop owned by the authenticated seller along with product and order counts.',
  })
  @ApiStandardResponse({ type: ShopResponseDto, description: 'Seller shop profile retrieved' })
  getShopProfile(@Request() req: AuthenticatedRequest) {
    return this.sellerPortalService.getShopProfile(req.user.id);
  }

  @Patch('shop')
  @ApiOperation({
    summary: 'Update current seller shop profile',
    description: 'Updates shop branding, contact channels, location and operational metadata.',
  })
  @ApiStandardResponse({ type: ShopResponseDto, description: 'Seller shop updated successfully' })
  updateShopProfile(@Request() req: AuthenticatedRequest, @Body() dto: UpdateSellerShopDto) {
    return this.sellerPortalService.updateShopProfile(req.user.id, dto);
  }

  @Post('shop/logo')
  @ApiOperation({
    summary: 'Upload shop logo',
    description:
      'Uploads an optimized shop logo to the seller storage namespace and updates the shop profile. Files are validated by magic bytes, size and MIME type.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Square logo image (JPEG, PNG or WebP, max 5MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiStandardResponse({ type: ShopResponseDto, description: 'Shop logo uploaded' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_UPLOAD_BYTES } }))
  async uploadShopLogo(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File is required');
    const shop = await this.sellerPortalService.getShopForSeller(req.user.id);
    const validation = this.storageService.validateImage(file.buffer, file.mimetype);
    const storagePath = this.storageService.getSellerShopImagePath(shop.id, 'logo', validation.ext);
    const result = await this.storageService.replaceImage(
      shop.logo,
      storagePath,
      file.buffer,
      validation.mimeType,
    );
    return this.sellerPortalService.updateShopProfile(req.user.id, { logo: result.publicUrl });
  }

  @Post('shop/banner')
  @ApiOperation({
    summary: 'Upload shop cover banner',
    description: 'Uploads an optimized shop cover banner and updates the shop profile.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Wide cover image (JPEG, PNG or WebP, max 5MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiStandardResponse({ type: ShopResponseDto, description: 'Shop banner uploaded' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_UPLOAD_BYTES } }))
  async uploadShopBanner(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File is required');
    const shop = await this.sellerPortalService.getShopForSeller(req.user.id);
    const validation = this.storageService.validateImage(file.buffer, file.mimetype);
    const storagePath = this.storageService.getSellerShopImagePath(
      shop.id,
      'cover',
      validation.ext,
    );
    const result = await this.storageService.replaceImage(
      shop.banner,
      storagePath,
      file.buffer,
      validation.mimeType,
    );
    return this.sellerPortalService.updateShopProfile(req.user.id, { banner: result.publicUrl });
  }

  // ----------------------------------------------------------- product form

  @Get('catalog/categories')
  @ApiOperation({
    summary: 'List categories available for product creation',
    description: 'Returns all active categories (parents and sub-categories) for the product form.',
  })
  @ApiStandardResponse({
    type: SellerCategoryOptionDto,
    isArray: true,
    description: 'Active categories',
  })
  listCategories() {
    return this.sellerProductsService.listCategories();
  }

  @Get('catalog/brands')
  @ApiOperation({
    summary: 'List brands available for product creation',
    description: 'Returns all active brands for the product form.',
  })
  @ApiStandardResponse({
    type: SellerBrandOptionDto,
    isArray: true,
    description: 'Active brands',
  })
  listBrands() {
    return this.sellerProductsService.listBrands();
  }

  // -------------------------------------------------------------- products

  @Get('products')
  @ApiOperation({
    summary: 'List products listed by the seller',
    description:
      'Returns a paginated inventory list of the shop’s listings with pricing, stock state, images and units sold.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['ALL', 'ACTIVE', 'INACTIVE'] })
  @ApiQuery({
    name: 'stock',
    required: false,
    enum: ['ALL', 'LOW_STOCK', 'IN_STOCK', 'OUT_OF_STOCK'],
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['newest', 'oldest', 'price_asc', 'price_desc'],
  })
  @ApiStandardResponse({ type: SellerProductListDto, description: 'Seller product listings' })
  listProducts(@Request() req: AuthenticatedRequest, @Query() query: SellerProductQueryDto) {
    return this.sellerProductsService.listProducts(req.user.id, query);
  }

  @Post('products')
  @ApiOperation({
    summary: 'Create a product for the seller shop',
    description:
      'Creates a catalog product owned by the shop, its default variant, the shop listing and the initial stock record in a single transaction.',
  })
  @ApiStandardResponse({
    type: SellerProductDetailDto,
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
  })
  createProduct(@Request() req: AuthenticatedRequest, @Body() dto: CreateSellerProductDto) {
    return this.sellerProductsService.createProduct(req.user.id, dto);
  }

  @Get('products/:id')
  @ApiOperation({
    summary: 'Get a single product listing',
    description: 'Returns full detail for a listing owned by the authenticated seller’s shop.',
  })
  @ApiParam({ name: 'id', description: 'Seller listing UUID' })
  @ApiStandardResponse({ type: SellerProductDetailDto, description: 'Seller product detail' })
  getProduct(@Request() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.sellerProductsService.getProduct(req.user.id, id);
  }

  @Patch('products/:id')
  @ApiOperation({
    summary: 'Update price, stock, status or owned catalog details',
    description:
      'Listing fields (price, discount, stock, active flag) are always editable. Catalog fields (name, description, category, brand, unit) are only accepted when the shop owns the underlying catalog product.',
  })
  @ApiParam({ name: 'id', description: 'Seller listing UUID' })
  @ApiStandardResponse({
    type: SellerProductDetailDto,
    description: 'Seller product updated successfully',
  })
  updateProduct(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSellerProductDto,
  ) {
    return this.sellerProductsService.updateProduct(req.user.id, id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({
    summary: 'Archive a product listing',
    description:
      'Deactivates the shop listing. Products created by the shop are also unpublished from the storefront; platform catalog products remain available to other shops.',
  })
  @ApiParam({ name: 'id', description: 'Seller listing UUID' })
  @ApiStandardResponse({
    type: SellerProductDetailDto,
    description: 'Seller product archived',
  })
  archiveProduct(@Request() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.sellerProductsService.archiveProduct(req.user.id, id);
  }

  // ---------------------------------------------------------- product media

  @Post('products/:id/images')
  @ApiOperation({
    summary: 'Upload optimized product images',
    description:
      'Uploads up to 10 already client-optimized images for a seller-owned product. Each file is validated by magic bytes, MIME type and size before being stored and linked to the gallery.',
  })
  @ApiParam({ name: 'id', description: 'Seller listing UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Optimized product images (JPEG, PNG or WebP, max 5MB each)',
        },
      },
      required: ['files'],
    },
  })
  @ApiStandardResponse({
    type: SellerProductDetailDto,
    status: HttpStatus.CREATED,
    description: 'Images uploaded and listing returned',
  })
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: MAX_IMAGE_UPLOAD_BYTES } }))
  uploadProductImages(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.sellerProductsService.uploadImages(req.user.id, id, files ?? []);
  }

  @Patch('products/:id/images/:imageId/primary')
  @ApiOperation({
    summary: 'Set the primary product image',
    description: 'Marks one of the seller-owned product images as the storefront thumbnail.',
  })
  @ApiParam({ name: 'id', description: 'Seller listing UUID' })
  @ApiParam({ name: 'imageId', description: 'Product image UUID' })
  @ApiStandardResponse({
    type: SellerProductDetailDto,
    description: 'Primary image updated',
  })
  setPrimaryImage(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.sellerProductsService.setPrimaryImage(req.user.id, id, imageId);
  }

  @Patch('products/:id/images/reorder')
  @ApiOperation({
    summary: 'Reorder product images',
    description: 'Sets the gallery display order for the seller-owned product images.',
  })
  @ApiParam({ name: 'id', description: 'Seller listing UUID' })
  @ApiStandardResponse({
    type: SellerProductDetailDto,
    description: 'Images reordered',
  })
  reorderImages(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderImagesDto,
  ) {
    return this.sellerProductsService.reorderImages(req.user.id, id, dto.imageIds);
  }

  @Delete('products/:id/images/:imageId')
  @ApiOperation({
    summary: 'Delete a product image',
    description:
      'Removes the image record and deletes the object from storage. If the primary image is removed, the next image is promoted automatically.',
  })
  @ApiParam({ name: 'id', description: 'Seller listing UUID' })
  @ApiParam({ name: 'imageId', description: 'Product image UUID' })
  @ApiStandardResponse({
    type: SellerProductDetailDto,
    description: 'Image deleted',
  })
  deleteProductImage(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.sellerProductsService.deleteImage(req.user.id, id, imageId);
  }

  // ------------------------------------------------------------- inventory

  @Patch('inventory/bulk')
  @ApiOperation({
    summary: 'Bulk update stock levels',
    description:
      'Applies quantity and optional low-stock threshold changes to several listings at once. Rejects negative stock and any product that does not belong to the shop.',
  })
  @ApiStandardResponse({
    type: BulkStockUpdateResultDto,
    description: 'Number of listings updated',
  })
  bulkUpdateStock(@Request() req: AuthenticatedRequest, @Body() dto: BulkStockUpdateDto) {
    return this.sellerProductsService.bulkUpdateStock(req.user.id, dto.items);
  }

  // ---------------------------------------------------------------- orders

  @Get('orders')
  @ApiOperation({
    summary: 'List orders containing this shop’s products',
    description:
      'Returns a paginated list scoped to the seller’s shop. Each order exposes only this shop’s items and the statuses the seller may transition it into.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'needsAction',
    required: false,
    type: Boolean,
    description: 'Only return orders awaiting a seller action',
  })
  @ApiStandardResponse({ type: SellerOrderListDto, description: 'Seller orders' })
  listOrders(@Request() req: AuthenticatedRequest, @Query() query: SellerOrderQueryDto) {
    return this.sellerPortalService.getOrders(req.user.id, query);
  }

  @Get('orders/:id')
  @ApiOperation({
    summary: 'Get details for one of the shop’s orders',
    description:
      'Returns the order filtered to this seller’s items only, with pricing, payment state, delivery details and the full status timeline.',
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiStandardResponse({ type: SellerOrderDetailDto, description: 'Seller order detail' })
  getOrderDetails(@Request() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.sellerPortalService.getOrderDetails(req.user.id, id);
  }

  @Patch('orders/:id/status')
  @ApiOperation({
    summary: 'Transition seller order status',
    description:
      'Transitions an order containing this shop’s products through the allowed state machine steps (PENDING -> CONFIRMED -> PROCESSING -> READY_FOR_PICKUP, or CANCELLED).',
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiStandardResponse({ type: SellerOrderDetailDto, description: 'Order status transitioned' })
  transitionOrderStatus(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransitionOrderDto,
  ) {
    return this.sellerPortalService.transitionOrderStatus(req.user.id, id, dto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string | undefined,
    });
  }

  // -------------------------------------------------------------- profile

  @Post('profile/avatar')
  @ApiOperation({
    summary: 'Upload seller avatar',
    description:
      'Uploads an optimized avatar image to the seller profile storage namespace and updates the user profile.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image (JPEG, PNG or WebP, max 5MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiStandardResponse({ description: 'Seller avatar uploaded successfully' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_UPLOAD_BYTES } }))
  async uploadAvatar(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File is required');
    const validation = this.storageService.validateImage(file.buffer, file.mimetype);
    const storagePath = this.storageService.getSellerProfileImagePath(req.user.id, validation.ext);
    const result = await this.storageService.replaceImage(
      null,
      storagePath,
      file.buffer,
      validation.mimeType,
    );
    const updatedUser = await this.sellerPortalService.updateSellerAvatar(
      req.user.id,
      result.publicUrl,
    );
    return {
      avatarUrl: result.publicUrl,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
      },
    };
  }

  // --------------------------------------------------------------- reviews

  @Get('reviews')
  @ApiOperation({
    summary: 'List reviews for the shop’s products',
    description:
      'Returns paginated reviews left on products this shop lists. Reviewer identity is masked to a first name and last initial.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'rating', required: false, type: Number, example: 5 })
  @ApiQuery({ name: 'replyState', required: false, enum: ['ALL', 'REPLIED', 'UNREPLIED'] })
  @ApiStandardResponse({ type: SellerReviewListDto, description: 'Shop product reviews' })
  listReviews(@Request() req: AuthenticatedRequest, @Query() query: SellerReviewQueryDto) {
    return this.sellerReviewsService.listReviews(req.user.id, query);
  }

  @Get('reviews/summary')
  @ApiOperation({
    summary: 'Get the shop review score summary',
    description: 'Returns the aggregate rating, total review count and per-star distribution.',
  })
  @ApiStandardResponse({
    type: SellerReviewSummaryDto,
    description: 'Shop review summary',
  })
  reviewSummary(@Request() req: AuthenticatedRequest) {
    return this.sellerReviewsService.summary(req.user.id);
  }

  @Patch('reviews/:id/reply')
  @ApiOperation({
    summary: 'Reply publicly to a product review',
    description:
      'Publishes the shop’s answer on a review left for one of its products. Rejects reviews that do not belong to the shop.',
  })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  @ApiStandardResponse({ type: SellerReviewItemDto, description: 'Review reply saved' })
  replyToReview(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplyToReviewDto,
  ) {
    return this.sellerReviewsService.reply(req.user.id, id, dto.message);
  }
}
