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
import { AquacultureService } from './aquaculture.service.js';
import {
  CreateHatcheryBatchDto,
  QueryHatcheryBatchesDto,
  UpdateHatcheryBatchDto,
  IngestPondTelemetryDto,
  RecordFeedFcrDto,
  BookLiveFishTankerDto,
  UpdateTankerStatusDto,
} from './dto/aquaculture.dto.js';
import { SpeciesName } from './enums/aquaculture.enum.js';

@ApiTags('Aquaculture, Shrimp Hatchery & Bio-Floc IoT')
@Controller('aquaculture')
export class AquacultureController {
  constructor(private readonly aquaService: AquacultureService) {}

  // --- Public Discovery & Calculators ---

  @Get('stats/overview')
  @ApiOperation({ summary: 'Public: Aquaculture platform telemetry and live tanker metrics' })
  async getOverviewStats() {
    const stats = await this.aquaService.getAquacultureOverviewStats();
    return { success: true, data: stats };
  }

  @Get('batches')
  @ApiOperation({ summary: 'Public: Query hatchery fingerling and shrimp PL batches' })
  async getHatcheryBatches(@Query() query: QueryHatcheryBatchesDto) {
    const batches = await this.aquaService.getHatcheryBatches(query);
    return { success: true, data: batches };
  }

  @Get('batches/:id')
  @ApiOperation({ summary: 'Public: Get hatchery batch details by ID' })
  async getHatcheryBatchById(@Param('id') id: string) {
    const batch = await this.aquaService.getHatcheryBatchById(id);
    return { success: true, data: batch };
  }

  @Get('arbitrage-calc')
  @ApiOperation({ summary: 'Public: Calculate live fish vs iced fish wholesale price premium' })
  async calculateArbitrage(
    @Query('species') species: SpeciesName,
    @Query('weightKg') weightKg: number,
  ) {
    const result = this.aquaService.calculateLiveFishMarketArbitrage(
      species || SpeciesName.RUI_ROHU,
      Number(weightKg) || 1000,
    );
    return { success: true, data: result };
  }

  @Get('fcr-calc')
  @ApiOperation({ summary: 'Public: Feed Conversion Ratio (FCR) and cost efficiency calculator' })
  async calculateFcr(
    @Query('feedKg') feedKg: number,
    @Query('biomassKg') biomassKg: number,
    @Query('species') species: SpeciesName,
  ) {
    const result = this.aquaService.calculateFcrAndEfficiency(
      Number(feedKg) || 1500,
      Number(biomassKg) || 1000,
      species || SpeciesName.MONOSEX_TILAPIA,
    );
    return { success: true, data: result };
  }

  // --- Hatchery Owner Operations ---

  @Post('batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hatchery Owner: Register certified post-larvae or fingerling batch' })
  async createHatcheryBatch(@Req() req: any, @Body() dto: CreateHatcheryBatchDto) {
    const ownerId = req.user.id;
    const batch = await this.aquaService.createHatcheryBatch(ownerId, dto);
    return { success: true, data: batch };
  }

  @Get('seller/my-batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hatchery Owner: Get all batches owned by current seller' })
  async getMyBatches(@Req() req: any) {
    const ownerId = req.user.id;
    const batches = await this.aquaService.getHatcheryBatchesByOwner(ownerId);
    return { success: true, data: batches };
  }

  @Patch('batches/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hatchery Owner/Admin: Update batch quantity, price or SPF status' })
  async updateHatcheryBatch(
    @Param('id') id: string,
    @Body() dto: UpdateHatcheryBatchDto,
  ) {
    const updated = await this.aquaService.updateHatcheryBatch(id, dto);
    return { success: true, data: updated };
  }

  // --- Pond Water Quality Telemetry ---

  @Post('telemetry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pond Farmer / IoT Gateway: Ingest pond dissolved oxygen and water parameters' })
  async ingestTelemetry(@Req() req: any, @Body() dto: IngestPondTelemetryDto) {
    const farmerId = req.user.id;
    const record = await this.aquaService.ingestPondTelemetry(farmerId, dto);
    return { success: true, data: record };
  }

  @Get('telemetry/pond/:pondId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pond Farmer: Get telemetry stream and hypoxia alerts for specific pond' })
  async getPondTelemetry(@Param('pondId') pondId: string) {
    const records = await this.aquaService.getPondTelemetry(pondId);
    return { success: true, data: records };
  }

  @Get('telemetry/farmer/latest')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pond Farmer: Get latest readings for all owned aquaculture ponds' })
  async getFarmerLatestTelemetry(@Req() req: any) {
    const farmerId = req.user.id;
    const records = await this.aquaService.getFarmerLatestTelemetry(farmerId);
    return { success: true, data: records };
  }

  // --- Feed & FCR Tracking ---

  @Post('fcr/logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Farmer: Record feed consumption and biomass sampling for FCR analysis' })
  async recordFeedFcr(@Req() req: any, @Body() dto: RecordFeedFcrDto) {
    const farmerId = req.user.id;
    const log = await this.aquaService.recordFeedFcr(farmerId, dto);
    return { success: true, data: log };
  }

  @Get('fcr/pond/:pondId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Farmer: Get FCR history for specific pond' })
  async getPondFcrLogs(@Param('pondId') pondId: string) {
    const logs = await this.aquaService.getPondFcrLogs(pondId);
    return { success: true, data: logs };
  }

  @Get('fcr/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Farmer: Get all personal FCR logs' })
  async getFarmerFcrLogs(@Req() req: any) {
    const farmerId = req.user.id;
    const logs = await this.aquaService.getFarmerFcrLogs(farmerId);
    return { success: true, data: logs };
  }

  // --- Live Fish Aerated Tanker Logistics ---

  @Post('tankers/book')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Wholesale Buyer / Farmer: Book aerated water tanker for live fish transit' })
  async bookLiveFishTanker(@Req() req: any, @Body() dto: BookLiveFishTankerDto) {
    const buyerId = req.user.id;
    const booking = await this.aquaService.bookLiveFishTanker(buyerId, dto);
    return { success: true, data: booking };
  }

  @Get('tankers/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer: Get all live fish tanker bookings' })
  async getMyTankerBookings(@Req() req: any) {
    const buyerId = req.user.id;
    const bookings = await this.aquaService.getBuyerTankerBookings(buyerId);
    return { success: true, data: bookings };
  }

  @Get('admin/tankers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin / DoF: Monitor all nationwide live fish tankers in transit' })
  async getAllTankerBookings() {
    const bookings = await this.aquaService.getAllTankerBookings();
    return { success: true, data: bookings };
  }

  @Patch('admin/tankers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update live tanker dispatch status and driver assignment' })
  async updateTankerStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTankerStatusDto,
  ) {
    const updated = await this.aquaService.updateTankerStatus(id, dto);
    return { success: true, data: updated };
  }
}
