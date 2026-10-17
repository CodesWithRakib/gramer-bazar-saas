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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { MachineryRentalService } from './machinery-rental.service.js';
import {
  CreateMachineryBookingDto,
  CreateMachineryInspectionDto,
  CreateMachineryItemDto,
  QueryMachineryDto,
  QuoteMachineryBookingDto,
  ResolveDepositDto,
  UpdateBookingStatusDto,
  UpdateMachineryItemDto,
} from './dto/machinery.dto.js';
import { BookingStatus } from './enums/machinery.enum.js';

@ApiTags('Rural Machinery & Irrigation Rental')
@Controller('machinery-rental')
export class MachineryRentalController {
  constructor(private readonly machineryService: MachineryRentalService) {}

  // --- Public Browsing & Quotation ---

  @Get('items')
  @ApiOperation({ summary: 'Public: Search and filter available machinery and irrigation equipment' })
  async getItems(@Query() query: QueryMachineryDto) {
    const result = await this.machineryService.getItems(query);
    return { success: true, data: result };
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Public: Get equipment specifications and rates by ID' })
  async getItemById(@Param('id') id: string) {
    const item = await this.machineryService.getItemById(id);
    return { success: true, data: item };
  }

  @Post('quote')
  @ApiOperation({ summary: 'Public: Calculate quotation with automated neighbor cluster pooling discount' })
  async calculateQuote(@Body() dto: QuoteMachineryBookingDto) {
    const quote = await this.machineryService.calculateQuote(dto);
    return { success: true, data: quote };
  }

  // --- Farmer / Customer Rental Bookings ---

  @Post('bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer/Farmer: Book machinery with escrow security deposit' })
  async createBooking(@Req() req: any, @Body() dto: CreateMachineryBookingDto) {
    const booking = await this.machineryService.createBooking(req.user.id, dto);
    return { success: true, data: booking };
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer: List all my equipment rental bookings' })
  async getMyBookings(@Req() req: any) {
    const bookings = await this.machineryService.getMyBookings(req.user.id);
    return { success: true, data: bookings };
  }

  @Get('bookings/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking details by ID (Renter, Owner, or Admin)' })
  async getBookingById(@Req() req: any, @Param('id') id: string) {
    const isAdmin = req.user.role === Role.ADMIN || req.user.role === Role.SUPER_ADMIN;
    const booking = await this.machineryService.getBookingById(id, req.user.id, isAdmin);
    return { success: true, data: booking };
  }

  @Patch('bookings/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking status (Confirm, In-Progress, Complete, or Cancel)' })
  async updateBookingStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    const isAdmin = req.user.role === Role.ADMIN || req.user.role === Role.SUPER_ADMIN;
    const updated = await this.machineryService.updateBookingStatus(id, req.user.id, dto, isAdmin);
    return { success: true, data: updated };
  }

  // --- Machinery Owner Endpoints ---

  @Post('items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Owner: Register new agricultural equipment or pump for hire' })
  async createItem(@Req() req: any, @Body() dto: CreateMachineryItemDto) {
    const item = await this.machineryService.createItem(req.user.id, dto);
    return { success: true, data: item };
  }

  @Patch('items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Owner: Update equipment specs, status, or rates' })
  async updateItem(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateMachineryItemDto,
  ) {
    const isAdmin = req.user.role === Role.ADMIN || req.user.role === Role.SUPER_ADMIN;
    const updated = await this.machineryService.updateItem(id, req.user.id, dto, isAdmin);
    return { success: true, data: updated };
  }

  @Get('owner/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Owner: Get my registered equipment fleet' })
  async getOwnerItems(@Req() req: any) {
    const items = await this.machineryService.getOwnerItems(req.user.id);
    return { success: true, data: items };
  }

  @Get('owner/bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Owner: Get rental bookings for my fleet' })
  async getOwnerBookings(@Req() req: any) {
    const bookings = await this.machineryService.getOwnerBookings(req.user.id);
    return { success: true, data: bookings };
  }

  @Post('bookings/:id/inspect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Owner / Agent: Submit pre-dispatch or post-return inspection report' })
  async submitInspection(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateMachineryInspectionDto,
  ) {
    const inspection = await this.machineryService.submitInspection(id, req.user.id, dto);
    return { success: true, data: inspection };
  }

  // --- Admin Dispute Resolution & Oversight ---

  @Get('admin/bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiQuery({ name: 'status', enum: BookingStatus, required: false })
  @ApiOperation({ summary: 'Admin: Monitor all machinery rental bookings across Bangladesh' })
  async getAllBookings(@Query('status') status?: BookingStatus) {
    const bookings = await this.machineryService.getAllBookings({ status });
    return { success: true, data: bookings };
  }

  @Post('admin/bookings/:id/resolve-deposit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Settle disputed escrow security deposit between owner and farmer' })
  async resolveDeposit(
    @Param('id') id: string,
    @Body() dto: ResolveDepositDto,
  ) {
    const result = await this.machineryService.resolveDeposit(id, dto);
    return { success: true, data: result };
  }
}
