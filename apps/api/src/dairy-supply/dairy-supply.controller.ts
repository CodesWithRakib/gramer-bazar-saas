import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { DairySupplyService } from './dairy-supply.service.js';
import {
  CalculateMilkRateDto,
  CalculateFeedSavingsDto,
  CreateMilkCollectionDto,
  RecordChillingTelemetryDto,
  CreateFeedPoolDto,
  JoinFeedPoolDto,
} from './dto/dairy-supply.dto.js';

@ApiTags('Dairy Cooperative, Milk Chilling Center IoT & Feed Pooling')
@Controller('dairy-supply')
export class DairySupplyController {
  constructor(private readonly service: DairySupplyService) {}

  // --- Public Discovery & Quality Calculators ---

  @Get('stats/overview')
  @ApiOperation({ summary: 'Public: Nationwide dairy milk collection, chilling vats, and feed savings stats' })
  async getOverviewStats() {
    const stats = await this.service.getOverviewStats();
    return { success: true, data: stats };
  }

  @Post('calculate/milk-rate')
  @ApiOperation({ summary: 'Public: Richmond SNF% formula and fat-incentive milk pricing calculator' })
  calculateMilkRate(@Body() dto: CalculateMilkRateDto) {
    const result = this.service.calculateMilkRate(dto);
    return { success: true, data: result };
  }

  @Post('calculate/feed-savings')
  @ApiOperation({ summary: 'Public: Cattle feed bulk pooling group-savings calculator' })
  calculateFeedSavings(@Body() dto: CalculateFeedSavingsDto) {
    const result = this.service.calculateFeedSavings(dto);
    return { success: true, data: result };
  }

  @Get('chilling-vats')
  @ApiOperation({ summary: 'Public/Cooperative: Real-time IoT temperature and volume telemetry of Bulk Milk Coolers' })
  async getChillingVats() {
    const vats = await this.service.getChillingVats();
    return { success: true, data: vats };
  }

  @Get('feed-pools')
  @ApiOperation({ summary: 'Public/Dairy Farmers: Active livestock feed group-buying campaigns' })
  async getFeedPools() {
    const pools = await this.service.getFeedPools();
    return { success: true, data: pools };
  }

  // --- Authenticated Farmer Operations ---

  @Get('collections/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dairy Farmer: My daily milk delivery passbook and payout ledger' })
  async getMyCollections(@Req() req: any) {
    const farmerId = req.user?.id || 'farmer-dairy-01';
    const collections = await this.service.getMyCollections(farmerId);
    return { success: true, data: collections };
  }

  @Post('feed-pools/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dairy Farmer: Join a livestock feed bulk group-buy pool' })
  async joinFeedPool(@Body() dto: JoinFeedPoolDto) {
    const updated = await this.service.joinFeedPool(dto);
    return { success: true, data: updated };
  }

  // --- Cooperative Collector & Admin Operations ---

  @Post('collections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cooperative Collector: Record milk intake passbook entry' })
  async createCollectionEntry(@Req() req: any, @Body() dto: CreateMilkCollectionDto) {
    const farmerId = req.user?.id || 'farmer-dairy-01';
    const entry = await this.service.createCollectionEntry(farmerId, dto);
    return { success: true, data: entry };
  }

  @Get('collections/center/:centerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cooperative: Get daily milk collection records for specific chilling center' })
  async getCollectionsByCenter(@Param('centerId') centerId: string) {
    const collections = await this.service.getCollectionsByCenter(centerId);
    return { success: true, data: collections };
  }

  @Get('collections/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get nationwide milk collection intake records' })
  async getAllAdminCollections() {
    const collections = await this.service.getAllAdminCollections();
    return { success: true, data: collections };
  }

  @Patch('collections/:id/disburse')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/Co-op: Disburse milk payout to dairy farmer MFS/Bank wallet' })
  async disbursePayment(@Param('id') id: string) {
    const disbursed = await this.service.disbursePayment(id);
    return { success: true, data: disbursed };
  }

  @Post('chilling-vats/telemetry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'IoT Gateway / Admin: Ingest Bulk Milk Cooler sensor readings' })
  async recordChillingTelemetry(@Body() dto: RecordChillingTelemetryDto) {
    const vat = await this.service.recordChillingTelemetry(dto);
    return { success: true, data: vat };
  }

  @Post('feed-pools')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/Co-op: Create a new livestock feed bulk buy pool' })
  async createFeedPool(@Body() dto: CreateFeedPoolDto) {
    const pool = await this.service.createFeedPool(dto);
    return { success: true, data: pool };
  }
}
