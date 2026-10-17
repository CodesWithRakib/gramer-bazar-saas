import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { SericultureHandloomService } from './sericulture-handloom.service.js';
import {
  QueryArtisanProductsDto,
  CalculateCocoonReelingDto,
  CalculateFairWageDto,
  CreateHandloomProductDto,
  CreateCocoonBatchDto,
  CreateCustomOrderDto,
  UpdateLoomProgressDto,
} from './dto/sericulture-handloom.dto.js';

@ApiTags('Sericulture & Traditional Handloom Silk Supply Chain')
@Controller('sericulture-handloom')
export class SericultureHandloomController {
  constructor(private readonly service: SericultureHandloomService) {}

  // --- Public Discovery & Calculations ---

  @Get('stats/overview')
  @ApiOperation({ summary: 'Public: Overview statistics of silk cocoons, artisan products, and GI textiles' })
  async getOverviewStats() {
    const stats = await this.service.getOverviewStats();
    return { success: true, data: stats };
  }

  @Get('catalog')
  @ApiOperation({ summary: 'Public: Query heritage handloom products with craft and origin filters' })
  async getCatalog(@Query() query: QueryArtisanProductsDto) {
    const products = await this.service.getCatalog(query);
    return { success: true, data: products };
  }

  @Get('catalog/:id')
  @ApiOperation({ summary: 'Public: Get specific handloom product details and burn-test report' })
  async getProductById(@Param('id') id: string) {
    const product = await this.service.getProductById(id);
    return { success: true, data: product };
  }

  @Post('calculate/cocoon-reeling')
  @ApiOperation({ summary: 'Public: Calculate silkworm cocoon-to-silk filament yield and renditta ratio' })
  calculateCocoonReeling(@Body() dto: CalculateCocoonReelingDto) {
    const result = this.service.calculateCocoonReeling(dto);
    return { success: true, data: result };
  }

  @Post('calculate/fair-wage')
  @ApiOperation({ summary: 'Public: Transparent fair-wage artisan cost breakdown calculator' })
  calculateFairWage(@Body() dto: CalculateFairWageDto) {
    const result = this.service.calculateFairWage(dto);
    return { success: true, data: result };
  }

  @Get('cocoons')
  @ApiOperation({ summary: 'Public/Artisan: List sericulture silkworm cocoon harvest lots' })
  async getCocoonBatches() {
    const batches = await this.service.getCocoonBatches();
    return { success: true, data: batches };
  }

  // --- Authenticated Artisan & Farmer Operations ---

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Artisan: Register a new heritage handloom product' })
  async createProduct(@Req() req: any, @Body() dto: CreateHandloomProductDto) {
    const artisanId = req.user?.id || 'artisan-user';
    const artisanName = req.user?.fullName || req.user?.name || 'তাঁতি কারিগর';
    const product = await this.service.createProduct(artisanId, artisanName, dto);
    return { success: true, data: product };
  }

  @Patch('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Artisan: Update an existing handloom product' })
  async updateProduct(@Param('id') id: string, @Body() dto: Partial<CreateHandloomProductDto>) {
    const product = await this.service.updateProduct(id, dto);
    return { success: true, data: product };
  }

  @Post('cocoons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sericulture Farmer: Register silkworm cocoon harvest lot' })
  async createCocoonBatch(@Req() req: any, @Body() dto: CreateCocoonBatchDto) {
    const farmerId = req.user?.id || 'farmer-user';
    const batch = await this.service.createCocoonBatch(farmerId, dto);
    return { success: true, data: batch };
  }

  // --- Custom Commissions & Escrow Lifecycle ---

  @Post('orders/custom')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer: Commission a custom handloom weaving order with 50% escrow deposit' })
  async createCustomOrder(@Req() req: any, @Body() dto: CreateCustomOrderDto) {
    const buyerId = req.user?.id || 'buyer-user';
    const buyerName = req.user?.fullName || req.user?.name || 'গ্রাহক ক্রেতা';
    const buyerPhone = req.user?.phone || req.user?.phoneNumber || '01700000000';
    const order = await this.service.createCustomOrder(buyerId, buyerName, buyerPhone, dto);
    return { success: true, data: order };
  }

  @Get('orders/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer: Get my custom handloom commissioned orders' })
  async getMyCustomOrders(@Req() req: any) {
    const buyerId = req.user?.id || 'buyer-user-01';
    const orders = await this.service.getMyCustomOrders(buyerId);
    return { success: true, data: orders };
  }

  @Get('orders/artisan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Artisan: Get active custom orders on my looms' })
  async getArtisanOrders(@Req() req: any) {
    const artisanId = req.user?.id || 'artisan-jam-02';
    const orders = await this.service.getArtisanOrders(artisanId);
    return { success: true, data: orders };
  }

  @Get('orders/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/BHB: Get all active handloom orders and escrow statuses' })
  async getAllAdminOrders() {
    const orders = await this.service.getAllAdminOrders();
    return { success: true, data: orders };
  }

  @Patch('orders/:id/progress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Artisan: Update loom weaving progress and milestone status' })
  async updateLoomProgress(@Param('id') id: string, @Body() dto: UpdateLoomProgressDto) {
    const updated = await this.service.updateLoomProgress(id, dto);
    return { success: true, data: updated };
  }

  @Patch('orders/:id/settle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/BHB: Verify board inspection and release escrow to weaver' })
  async settleCustomOrder(@Param('id') id: string) {
    const settled = await this.service.settleCustomOrder(id);
    return { success: true, data: settled };
  }
}
