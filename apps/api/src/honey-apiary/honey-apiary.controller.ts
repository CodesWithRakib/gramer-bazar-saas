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
import { HoneyApiaryService } from './honey-apiary.service.js';
import {
  CalculateHoneyPurityDto,
  CalculateApiaryMigrationYieldDto,
  CreateHoneyHarvestLotDto,
  RegisterApiaryBoxDto,
  UpdateApiaryBoxHealthDto,
  CreateRoyalJellyBatchDto,
} from './dto/honey-apiary.dto.js';

@ApiTags('Honey & Apiary Traceability, Forest Beekeeping & Royal Jelly Engine')
@Controller('honey-apiary')
export class HoneyApiaryController {
  constructor(private readonly service: HoneyApiaryService) {}

  // --- Public Discovery & Diagnostic Calculators ---

  @Get('stats/overview')
  @ApiOperation({ summary: 'Public: Nationwide honey harvest, active apiary boxes, and superfood inventory stats' })
  async getOverviewStats() {
    const stats = await this.service.getOverviewStats();
    return { success: true, data: stats };
  }

  @Post('calculate/purity')
  @ApiOperation({ summary: 'Public: C4 carbon isotope and moisture honey purity & adulteration testing calculator' })
  calculateHoneyPurity(@Body() dto: CalculateHoneyPurityDto) {
    const result = this.service.calculateHoneyPurity(dto);
    return { success: true, data: result };
  }

  @Post('calculate/migration-yield')
  @ApiOperation({ summary: 'Public: Mobile bee box seasonal bloom honey yield and crop pollination bonus estimator' })
  calculateApiaryMigrationYield(@Body() dto: CalculateApiaryMigrationYieldDto) {
    const result = this.service.calculateApiaryMigrationYield(dto);
    return { success: true, data: result };
  }

  @Get('lots')
  @ApiOperation({ summary: 'Public: List all honey harvest lots with BSTI lab and Forest Department permits' })
  async getAllLots() {
    const lots = await this.service.getAllLots();
    return { success: true, data: lots };
  }

  @Get('lots/:id')
  @ApiOperation({ summary: 'Public: Get specific honey harvest lot details' })
  async getLotById(@Param('id') id: string) {
    const lot = await this.service.getLotById(id);
    return { success: true, data: lot };
  }

  @Get('boxes')
  @ApiOperation({ summary: 'Public/Beekeepers: List active mobile bee box colony units across Bangladesh' })
  async getAllApiaryBoxes() {
    const boxes = await this.service.getAllApiaryBoxes();
    return { success: true, data: boxes };
  }

  @Get('boxes/:id')
  @ApiOperation({ summary: 'Public: Get specific apiary colony box details' })
  async getApiaryBoxById(@Param('id') id: string) {
    const box = await this.service.getApiaryBoxById(id);
    return { success: true, data: box };
  }

  @Get('superfoods')
  @ApiOperation({ summary: 'Public: List fresh frozen royal jelly, bee propolis, and raw pollen superfood batches' })
  async getAllSuperfoodBatches() {
    const batches = await this.service.getAllSuperfoodBatches();
    return { success: true, data: batches };
  }

  // --- Authenticated Beekeeper & Admin Operations ---

  @Post('lots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Beekeeper / Mouwal: Register new honey harvest lot with lab certification' })
  async createHarvestLot(@Req() req: any, @Body() dto: CreateHoneyHarvestLotDto) {
    const beekeeperId = req.user?.id || 'mouwal-satkhira-01';
    const lot = await this.service.createHarvestLot(beekeeperId, dto);
    return { success: true, data: lot };
  }

  @Post('boxes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Beekeeper: Register a new mobile apiary colony box' })
  async registerApiaryBox(@Req() req: any, @Body() dto: RegisterApiaryBoxDto) {
    const beekeeperId = req.user?.id || 'beekeeper-tng-02';
    const box = await this.service.registerApiaryBox(beekeeperId, dto);
    return { success: true, data: box };
  }

  @Patch('boxes/:id/health')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Beekeeper: Update apiary box brood health status, GPS, or migration location' })
  async updateApiaryBoxHealth(
    @Param('id') id: string,
    @Body() dto: UpdateApiaryBoxHealthDto,
  ) {
    const updated = await this.service.updateApiaryBoxHealth(id, dto);
    return { success: true, data: updated };
  }

  @Post('superfoods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Producer / Admin: Register new deep-frozen royal jelly or bee propolis superfood batch' })
  async createSuperfoodBatch(@Body() dto: CreateRoyalJellyBatchDto) {
    const batch = await this.service.createSuperfoodBatch(dto);
    return { success: true, data: batch };
  }
}
