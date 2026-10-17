import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MushroomFarmingService } from './mushroom-farming.service.js';
import {
  CalculateDehydrationYieldDto,
  CalculateChamberClimateDto,
  CreateSpawnBatchDto,
  RecordChamberTelemetryDto,
  CreateDehydratedLotDto,
} from './dto/mushroom-farming.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';

@Controller('mushroom-farming')
export class MushroomFarmingController {
  constructor(private readonly mushroomService: MushroomFarmingService) {}

  @Get('stats/overview')
  async getOverviewStats() {
    const data = await this.mushroomService.getOverviewStats();
    return { success: true, data };
  }

  @Post('calculate/dehydration')
  @HttpCode(HttpStatus.OK)
  calculateDehydrationYield(@Body() dto: CalculateDehydrationYieldDto) {
    const data = this.mushroomService.calculateDehydrationYield(dto);
    return { success: true, data };
  }

  @Post('evaluate/chamber-climate')
  @HttpCode(HttpStatus.OK)
  evaluateChamberClimate(@Body() dto: CalculateChamberClimateDto) {
    const data = this.mushroomService.evaluateChamberClimate(dto);
    return { success: true, data };
  }

  @Get('spawn/batches')
  async getAllSpawnBatches() {
    const data = await this.mushroomService.getAllSpawnBatches();
    return { success: true, data };
  }

  @Get('spawn/batches/:id')
  async getSpawnBatchById(@Param('id') id: string) {
    const data = await this.mushroomService.getSpawnBatchById(id);
    return { success: true, data };
  }

  @Post('spawn/batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  async createSpawnBatch(@Body() dto: CreateSpawnBatchDto) {
    const data = await this.mushroomService.createSpawnBatch(dto);
    return { success: true, data };
  }

  @Get('chambers')
  async getAllChambers() {
    const data = await this.mushroomService.getAllChambers();
    return { success: true, data };
  }

  @Post('chambers/record')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  async recordChamberTelemetry(@Body() dto: RecordChamberTelemetryDto) {
    const data = await this.mushroomService.recordChamberTelemetry(dto);
    return { success: true, data };
  }

  @Get('lots/dehydrated')
  async getAllDehydratedLots() {
    const data = await this.mushroomService.getAllDehydratedLots();
    return { success: true, data };
  }

  @Post('lots/dehydrated')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  async createDehydratedLot(@Body() dto: CreateDehydratedLotDto) {
    const data = await this.mushroomService.createDehydratedLot(dto);
    return { success: true, data };
  }
}
