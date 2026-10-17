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
import { AgroTourismService } from './agro-tourism.service.js';
import {
  CreateFarmStayListingDto,
  CreateAgroExperiencePackageDto,
  CalculateBookingPriceDto,
  CreateFarmStayBookingDto,
  VerifyCheckInDto,
  FarmStayFilterDto,
} from './dto/agro-tourism.dto.js';

@ApiTags('Agro-Tourism, Farm Stays & Rural Eco-Experiences')
@Controller('agro-tourism')
export class AgroTourismController {
  constructor(private readonly agroService: AgroTourismService) {}

  // --- Public Discovery & Calculations ---

  @Get('stats/overview')
  @ApiOperation({ summary: 'Public: Agro-Tourism metrics, active cottages and rural revenue' })
  async getOverviewStats() {
    const stats = await this.agroService.getOverviewStats();
    return { success: true, data: stats };
  }

  @Get('stays')
  @ApiOperation({ summary: 'Public: Search and filter farm stays and eco-cottages' })
  async getAllStays(@Query() filters: FarmStayFilterDto) {
    const stays = await this.agroService.findAllFarmStays(filters);
    return { success: true, data: stays };
  }

  @Get('stays/:id')
  @ApiOperation({ summary: 'Public: Get specific farm stay details with experiences' })
  async getStayById(@Param('id') id: string) {
    const stay = await this.agroService.findFarmStayById(id);
    return { success: true, data: stay };
  }

  @Get('experiences')
  @ApiOperation({ summary: 'Public: Get active agro-experiences and workshops' })
  async getAllExperiences(@Query('farmStayId') farmStayId?: string) {
    const experiences = await this.agroService.findAllExperiences(farmStayId);
    return { success: true, data: experiences };
  }

  @Post('calculate-price')
  @ApiOperation({ summary: 'Public: Dynamic price calculation with weekend rates, meals and activities' })
  async calculatePrice(@Body() dto: CalculateBookingPriceDto) {
    const result = await this.agroService.calculateBookingPrice(dto);
    return { success: true, data: result };
  }

  // --- Customer Booking Lifecycle ---

  @Post('bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer: Create escrow-guaranteed farm stay reservation' })
  async createBooking(@Req() req: any, @Body() dto: CreateFarmStayBookingDto) {
    const guestUserId = req.user.id;
    const booking = await this.agroService.createBooking(guestUserId, dto);
    return { success: true, data: booking };
  }

  @Get('bookings/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer: Get my upcoming and past farm stay bookings' })
  async getMyBookings(@Req() req: any) {
    const guestUserId = req.user.id;
    const bookings = await this.agroService.findMyBookings(guestUserId);
    return { success: true, data: bookings };
  }

  // --- Host / Seller Cottage Management ---

  @Get('host/my-listings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Host: Get all farm stays listed by current host' })
  async getHostListings(@Req() req: any) {
    const hostId = req.user.id;
    const listings = await this.agroService.findMyListings(hostId);
    return { success: true, data: listings };
  }

  @Post('host/listings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Host: List new farm stay or eco-cottage' })
  async createListing(@Req() req: any, @Body() dto: CreateFarmStayListingDto) {
    const hostId = req.user.id;
    const listing = await this.agroService.createFarmStay(hostId, dto);
    return { success: true, data: listing };
  }

  @Patch('host/listings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Host: Update farm stay details or rates' })
  async updateListing(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: Partial<CreateFarmStayListingDto>,
  ) {
    const hostId = req.user.id;
    const updated = await this.agroService.updateFarmStay(id, hostId, dto);
    return { success: true, data: updated };
  }

  @Post('host/experiences')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Host: Create agro-experience activity package' })
  async createExperience(@Body() dto: CreateAgroExperiencePackageDto) {
    const exp = await this.agroService.createExperience(dto);
    return { success: true, data: exp };
  }

  @Get('host/bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Host: View incoming guest reservations' })
  async getHostBookings(@Req() req: any) {
    const hostId = req.user.id;
    const bookings = await this.agroService.findHostBookings(hostId);
    return { success: true, data: bookings };
  }

  @Post('host/verify-checkin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Host: Verify 4-digit guest check-in PIN to unlock escrow' })
  async verifyCheckIn(@Req() req: any, @Body() dto: VerifyCheckInDto) {
    const hostId = req.user.id;
    const verified = await this.agroService.verifyCheckIn(dto, hostId);
    return { success: true, data: verified };
  }

  // --- Admin Governance & Escrow ---

  @Get('admin/bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Nationwide farm stay reservations ledger' })
  async getAllAdminBookings() {
    const bookings = await this.agroService.getAllBookingsAdmin();
    return { success: true, data: bookings };
  }

  @Post('admin/bookings/:id/release-payout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Manually release escrow funds to rural host' })
  async releaseEscrowPayout(@Param('id') id: string) {
    const released = await this.agroService.releasePayout(id);
    return { success: true, data: released };
  }
}
