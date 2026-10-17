import {
  Controller,
  Get,
  Post,
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
import { PoultryHatcheryService } from './poultry-hatchery.service.js';
import {
  CalculateFlockFcrDto,
  EvaluateEggGradingDto,
  CreatePoultryBatchDto,
  RecordBrooderTelemetryDto,
  CreateTableEggLotDto,
} from './dto/poultry-hatchery.dto.js';

@ApiTags('Poultry & Hatchery Supply Chain, Brooding IoT & Egg Grading')
@Controller('poultry-hatchery')
export class PoultryHatcheryController {
  constructor(private readonly service: PoultryHatcheryService) {}

  // --- Public Discovery & Diagnostic Calculators ---

  @Get('stats/overview')
  @ApiOperation({ summary: 'Public: Nationwide poultry flock count, DOC nursery, and egg production stats' })
  async getOverviewStats() {
    const stats = await this.service.getOverviewStats();
    return { success: true, data: stats };
  }

  @Post('calculate/fcr')
  @ApiOperation({ summary: 'Public: Feed Conversion Ratio (FCR), biomass, and mortality benchmark calculator' })
  calculateFlockFcr(@Body() dto: CalculateFlockFcrDto) {
    const result = this.service.calculateFlockFcrAndMortality(dto);
    return { success: true, data: result };
  }

  @Post('calculate/egg-grading')
  @ApiOperation({ summary: 'Public: Commercial table egg weight-based sorting, grading, and valuation calculator' })
  evaluateEggGrading(@Body() dto: EvaluateEggGradingDto) {
    const result = this.service.evaluateEggGrading(dto);
    return { success: true, data: result };
  }

  @Get('batches')
  @ApiOperation({ summary: 'Public: List all hatchery day-old-chick (DOC) and finisher poultry batches' })
  async getAllBatches() {
    const batches = await this.service.getAllBatches();
    return { success: true, data: batches };
  }

  @Get('batches/:id')
  @ApiOperation({ summary: 'Public: Get specific poultry hatchery batch details' })
  async getBatchById(@Param('id') id: string) {
    const batch = await this.service.getBatchById(id);
    return { success: true, data: batch };
  }

  @Get('brooder-telemetry')
  @ApiOperation({ summary: 'Public/Poultry Farmers: Real-time IoT brooding shed temperature, humidity & ammonia dials' })
  async getAllBrooderTelemetry() {
    const sheds = await this.service.getAllBrooderTelemetry();
    return { success: true, data: sheds };
  }

  @Get('eggs')
  @ApiOperation({ summary: 'Public: List certified table egg grading lots with UV sanitization pass' })
  async getAllEggLots() {
    const lots = await this.service.getAllEggLots();
    return { success: true, data: lots };
  }

  // --- Authenticated Farmer & Admin Operations ---

  @Post('batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hatchery / Seller: Register new DOC or live poultry flock batch' })
  async createBatch(@Body() dto: CreatePoultryBatchDto) {
    const batch = await this.service.createBatch(dto);
    return { success: true, data: batch };
  }

  @Post('brooder-telemetry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'IoT Sensor / Farmer: Ingest real-time brooder shed environmental readings' })
  async recordBrooderTelemetry(@Body() dto: RecordBrooderTelemetryDto) {
    const shed = await this.service.recordBrooderTelemetry(dto);
    return { success: true, data: shed };
  }

  @Post('eggs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Layer Farm / Seller: Register new graded table egg batch' })
  async createEggLot(@Body() dto: CreateTableEggLotDto) {
    const lot = await this.service.createEggLot(dto);
    return { success: true, data: lot };
  }
}
