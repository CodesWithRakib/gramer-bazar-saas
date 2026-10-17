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
import { AgriPrecisionService } from './agri-precision.service.js';
import {
  BookDroneSprayingDto,
  CreateAgriInputDto,
  GenerateSoilHealthCardDto,
  QueryDroneUnitsDto,
  RegisterDroneUnitDto,
  ReportCounterfeitInputDto,
  UpdateDroneBookingStatusDto,
} from './dto/agri-precision.dto.js';

@ApiTags('Agri Precision, Anti-Counterfeit & Drone Services')
@Controller('agri-precision')
export class AgriPrecisionController {
  constructor(private readonly agriPrecisionService: AgriPrecisionService) {}

  // --- 1. Anti-Counterfeit Agri-Input Verification ---

  @Get('inputs/verify/:code')
  @ApiOperation({ summary: 'Public: Verify authenticity of fertilizer, seed, or pesticide barcode/QR' })
  async verifyInput(@Param('code') code: string) {
    const result = await this.agriPrecisionService.verifyInput(code);
    return { success: true, data: result };
  }

  @Post('inputs/report-counterfeit')
  @ApiOperation({ summary: 'Public/Farmer: Report adulterated chemical, fake seeds, or illegal price gouging' })
  async reportCounterfeit(@Req() req: any, @Body() dto: ReportCounterfeitInputDto) {
    const userId = req?.user?.id || null;
    const report = await this.agriPrecisionService.reportCounterfeit(userId, dto);
    return { success: true, data: report };
  }

  @Post('inputs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/Manufacturer: Register certified batch in official DAE registry' })
  async createInputItem(@Body() dto: CreateAgriInputDto) {
    const item = await this.agriPrecisionService.createInputItem(dto);
    return { success: true, data: item };
  }

  @Get('admin/counterfeit-reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Review citizen reports of fake pesticides and fertilizers' })
  async getCounterfeitReports() {
    const reports = await this.agriPrecisionService.getCounterfeitReports();
    return { success: true, data: reports };
  }

  @Patch('admin/counterfeit-reports/:id/escalate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Escalate suspicious report to DAE law enforcement magistrate' })
  async escalateReport(@Param('id') id: string) {
    const updated = await this.agriPrecisionService.escalateReportToDae(id);
    return { success: true, data: updated };
  }

  // --- 2. Agricultural Drone Spraying Fleet ---

  @Get('drones/units')
  @ApiOperation({ summary: 'Public: Browse certified agricultural drone spraying units' })
  async getDroneUnits(@Query() query: QueryDroneUnitsDto) {
    const result = await this.agriPrecisionService.findAllDroneUnits(query);
    return { success: true, data: result };
  }

  @Post('drones/units')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pilot: Register agricultural drone spraying unit' })
  async registerDroneUnit(@Req() req: any, @Body() dto: RegisterDroneUnitDto) {
    const unit = await this.agriPrecisionService.registerDroneUnit(req.user.id, dto);
    return { success: true, data: unit };
  }

  @Post('drones/book')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Farmer: Book precision drone spraying for farmland' })
  async bookDroneSpraying(@Req() req: any, @Body() dto: BookDroneSprayingDto) {
    const booking = await this.agriPrecisionService.bookDroneSpraying(req.user.id, dto);
    return { success: true, data: booking };
  }

  @Get('drones/bookings/farmer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Farmer: View my drone spraying bookings' })
  async getFarmerDroneBookings(@Req() req: any) {
    const bookings = await this.agriPrecisionService.getFarmerDroneBookings(req.user.id);
    return { success: true, data: bookings };
  }

  @Get('drones/bookings/pilot')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pilot: View spraying missions assigned to my drone fleet' })
  async getPilotDroneBookings(@Req() req: any) {
    const bookings = await this.agriPrecisionService.getPilotDroneBookings(req.user.id);
    return { success: true, data: bookings };
  }

  @Patch('drones/bookings/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pilot/Admin: Update drone flight mission status' })
  async updateDroneBookingStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDroneBookingStatusDto,
  ) {
    const booking = await this.agriPrecisionService.updateDroneBookingStatus(id, dto);
    return { success: true, data: booking };
  }

  // --- 3. Digital Soil Health Card & Nutrient Advisory Engine ---

  @Post('soil-cards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Farmer/Agronomist: Generate Soil Health Card with SRDI nutrient dosage' })
  async generateSoilHealthCard(@Req() req: any, @Body() dto: GenerateSoilHealthCardDto) {
    const card = await this.agriPrecisionService.generateSoilHealthCard(req.user.id, dto);
    return { success: true, data: card };
  }

  @Get('soil-cards/farmer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Farmer: View my digital soil health cards' })
  async getFarmerSoilCards(@Req() req: any) {
    const cards = await this.agriPrecisionService.getFarmerSoilCards(req.user.id);
    return { success: true, data: cards };
  }

  @Get('soil-cards/:id')
  @ApiOperation({ summary: 'Public/Farmer: View detailed diagnostic soil health card' })
  async getSoilCardById(@Param('id') id: string) {
    const card = await this.agriPrecisionService.getSoilCardById(id);
    return { success: true, data: card };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Public: Platform precision agriculture and input safety statistics' })
  async getPrecisionStats() {
    const stats = await this.agriPrecisionService.getPrecisionStats();
    return { success: true, data: stats };
  }
}
