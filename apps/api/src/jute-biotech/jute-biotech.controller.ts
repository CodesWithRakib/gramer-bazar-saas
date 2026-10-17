import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JuteBiotechService } from './jute-biotech.service.js';
import {
  CalculateMoistureDeductionDto,
  EvaluateRettingPondDto,
  CreateRettingBatchDto,
  UpdateRettingTelemetryDto,
  CreateFiberLotDto,
  CreateB2bContractDto,
} from './dto/jute-biotech.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';

@Controller('jute-biotech')
export class JuteBiotechController {
  constructor(private readonly juteService: JuteBiotechService) {}

  @Get('stats/overview')
  async getOverviewStats() {
    const data = await this.juteService.getOverviewStats();
    return { success: true, data };
  }

  @Post('calculate/moisture-weight')
  @HttpCode(HttpStatus.OK)
  calculateMoistureDeduction(@Body() dto: CalculateMoistureDeductionDto) {
    const data = this.juteService.calculateMoistureDeduction(dto);
    return { success: true, data };
  }

  @Post('evaluate/retting-pond')
  @HttpCode(HttpStatus.OK)
  evaluateRettingPond(@Body() dto: EvaluateRettingPondDto) {
    const data = this.juteService.evaluateRettingPond(dto);
    return { success: true, data };
  }

  @Get('retting/batches')
  async getAllRettingBatches() {
    const data = await this.juteService.getAllRettingBatches();
    return { success: true, data };
  }

  @Get('retting/batches/:id')
  async getRettingBatchById(@Param('id') id: string) {
    const data = await this.juteService.getRettingBatchById(id);
    return { success: true, data };
  }

  @Post('retting/batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  async createRettingBatch(@Body() dto: CreateRettingBatchDto) {
    const data = await this.juteService.createRettingBatch(dto);
    return { success: true, data };
  }

  @Patch('retting/batches/:id/telemetry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  async updateRettingTelemetry(
    @Param('id') id: string,
    @Body() dto: UpdateRettingTelemetryDto,
  ) {
    const data = await this.juteService.updateRettingTelemetry(id, dto);
    return { success: true, data };
  }

  @Get('fiber/lots')
  async getAllFiberLots() {
    const data = await this.juteService.getAllFiberLots();
    return { success: true, data };
  }

  @Post('fiber/lots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  async createFiberLot(@Body() dto: CreateFiberLotDto) {
    const data = await this.juteService.createFiberLot(dto);
    return { success: true, data };
  }

  @Get('contracts/b2b')
  async getAllB2bContracts() {
    const data = await this.juteService.getAllB2bContracts();
    return { success: true, data };
  }

  @Post('contracts/b2b')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  async createB2bContract(@Body() dto: CreateB2bContractDto) {
    const data = await this.juteService.createB2bContract(dto);
    return { success: true, data };
  }
}
