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
import { LivestockService } from './livestock.service.js';
import {
  CreateLivestockListingDto,
  UpdateLivestockListingDto,
  LivestockQueryDto,
  CommitEscrowPurchaseDto,
  RecordHealthPassportDto,
  AddVaccineRecordDto,
  CreateAIBookingDto,
  UpdateAIBookingStatusDto,
  CreateLivestockTransportDto,
  UpdateTransportStatusDto,
} from './dto/livestock.dto.js';
import { LivestockCategory } from './enums/livestock.enum.js';

@ApiTags('Livestock, Veterinary Passport & AI Pedigree')
@Controller('livestock')
export class LivestockController {
  constructor(private readonly livestockService: LivestockService) {}

  // --- Public Discovery & Calculators ---

  @Get('stats/overview')
  @ApiOperation({ summary: 'Public: Platform stats for livestock, DLS certificates & AI services' })
  async getOverviewStats() {
    const stats = await this.livestockService.getOverviewStats();
    return { success: true, data: stats };
  }

  @Get('listings')
  @ApiOperation({ summary: 'Public: Search and filter livestock listings' })
  async getListings(@Query() query: LivestockQueryDto) {
    const listings = await this.livestockService.getListings(query);
    return { success: true, data: listings };
  }

  @Get('meat-yield-calc')
  @ApiOperation({ summary: 'Public: Calculate dressing percentage, net meat and market valuation' })
  async calculateMeatYield(
    @Query('weightKg') weightKg: number,
    @Query('category') category: LivestockCategory,
  ) {
    const calc = this.livestockService.estimateMeatYield(Number(weightKg) || 300, category || LivestockCategory.BEEF_CATTLE);
    return { success: true, data: calc };
  }

  @Get('ai-window-calc')
  @ApiOperation({ summary: 'Public: Compute optimal artificial insemination window by AM/PM rule' })
  async calculateAIWindow(@Query('heatObservedAt') heatObservedAt: string) {
    const window = this.livestockService.calculateOptimalInseminationWindow(heatObservedAt || new Date().toISOString());
    return { success: true, data: window };
  }

  @Get('passport/:earTag')
  @ApiOperation({ summary: 'Public: Retrieve official DLS veterinary health passport by ear tag' })
  async getPassport(@Param('earTag') earTag: string) {
    const passport = await this.livestockService.getPassportByEarTag(earTag);
    return { success: true, data: passport };
  }

  @Get('listings/tag/:earTag')
  @ApiOperation({ summary: 'Public: Get listing by unique DLS ear tag number' })
  async getListingByEarTag(@Param('earTag') earTag: string) {
    const listing = await this.livestockService.getListingByEarTag(earTag);
    return { success: true, data: listing };
  }

  @Get('listings/:id')
  @ApiOperation({ summary: 'Public: Get listing details with Qurbani compliance check' })
  async getListingById(@Param('id') id: string) {
    const listing = await this.livestockService.getListingById(id);
    const qurbaniCheck = this.livestockService.validateQurbaniEligibility(listing);
    const meatYield = this.livestockService.estimateMeatYield(Number(listing.liveWeightKg), listing.category);
    return {
      success: true,
      data: {
        ...listing,
        qurbaniCompliance: qurbaniCheck,
        estimatedMeatYield: meatYield,
      },
    };
  }

  // --- Seller Operations ---

  @Post('listings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller: Register and list new cattle/livestock on marketplace' })
  async createListing(@Req() req: any, @Body() dto: CreateLivestockListingDto) {
    const sellerId = req.user.id;
    const listing = await this.livestockService.createListing(sellerId, dto);
    return { success: true, data: listing };
  }

  @Get('seller/my-listings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller: Get all livestock listings owned by current farmer/seller' })
  async getMyListings(@Req() req: any) {
    const sellerId = req.user.id;
    const listings = await this.livestockService.getSellerListings(sellerId);
    return { success: true, data: listings };
  }

  @Patch('listings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller: Update livestock listing price, milk yield or status' })
  async updateListing(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateLivestockListingDto,
  ) {
    const sellerId = req.user.id;
    const updated = await this.livestockService.updateListing(id, sellerId, dto);
    return { success: true, data: updated };
  }

  // --- Escrow Transactions ---

  @Post('listings/:id/escrow')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer: Commit payment into escrow for livestock purchase' })
  async commitEscrow(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CommitEscrowPurchaseDto,
  ) {
    const buyerId = req.user.id;
    const result = await this.livestockService.commitEscrowPurchase(id, buyerId, dto);
    return { success: true, data: result };
  }

  @Post('listings/:id/escrow/release')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer/Admin: Release escrow payment to seller upon satisfactory delivery' })
  async releaseEscrow(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    const result = await this.livestockService.releaseEscrowToSeller(id, userId);
    return { success: true, data: result };
  }

  @Post('listings/:id/escrow/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Refund escrow funds to buyer in case of dispute or illness' })
  async refundEscrow(@Req() req: any, @Param('id') id: string) {
    const adminId = req.user.id;
    const result = await this.livestockService.refundEscrowToBuyer(id, adminId);
    return { success: true, data: result };
  }

  // --- Veterinary Health Passport Issuance ---

  @Post('passport')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/DLS Officer: Record official veterinary health passport' })
  async recordPassport(@Body() dto: RecordHealthPassportDto) {
    const passport = await this.livestockService.recordHealthPassport(dto);
    return { success: true, data: passport };
  }

  @Post('passport/:earTag/vaccine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/DLS Officer: Add vaccine entry to livestock health ledger' })
  async addVaccineRecord(
    @Param('earTag') earTag: string,
    @Body() dto: AddVaccineRecordDto,
  ) {
    const passport = await this.livestockService.addVaccineRecord(earTag, dto);
    return { success: true, data: passport };
  }

  // --- Artificial Insemination (AI) Services ---

  @Post('ai/bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Farmer: Book certified artificial insemination technician visit' })
  async createAIBooking(@Req() req: any, @Body() dto: CreateAIBookingDto) {
    const farmerId = req.user.id;
    const booking = await this.livestockService.createAIBooking(farmerId, dto);
    return { success: true, data: booking };
  }

  @Get('ai/bookings/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Farmer: Get all AI insemination service requests booked by current user' })
  async getMyAIBookings(@Req() req: any) {
    const farmerId = req.user.id;
    const bookings = await this.livestockService.getFarmerAIBookings(farmerId);
    return { success: true, data: bookings };
  }

  @Get('admin/ai/bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Monitor all nationwide AI breeding service requests' })
  async getAllAIBookings() {
    const bookings = await this.livestockService.getAllAIBookings();
    return { success: true, data: bookings };
  }

  @Patch('admin/ai/bookings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Assign technician and progress AI status' })
  async updateAIBookingStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAIBookingStatusDto,
  ) {
    const updated = await this.livestockService.updateAIBookingStatus(id, dto);
    return { success: true, data: updated };
  }

  // --- Livestock Specialized Transport Logistics ---

  @Post('transport/bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer: Book specialized livestock transport vehicle with straw bedding' })
  async createTransportBooking(@Req() req: any, @Body() dto: CreateLivestockTransportDto) {
    const buyerId = req.user.id;
    const booking = await this.livestockService.createTransportBooking(buyerId, dto);
    return { success: true, data: booking };
  }

  @Get('transport/bookings/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer: Get all livestock transport bookings for current user' })
  async getMyTransportBookings(@Req() req: any) {
    const buyerId = req.user.id;
    const bookings = await this.livestockService.getBuyerTransportBookings(buyerId);
    return { success: true, data: bookings };
  }

  @Get('admin/transport/bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: View all livestock transport consignments nationwide' })
  async getAllTransportBookings() {
    const bookings = await this.livestockService.getAllTransportBookings();
    return { success: true, data: bookings };
  }

  @Patch('admin/transport/bookings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update transit status, driver, and vehicle plate' })
  async updateTransportStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTransportStatusDto,
  ) {
    const updated = await this.livestockService.updateTransportStatus(id, dto);
    return { success: true, data: updated };
  }
}
