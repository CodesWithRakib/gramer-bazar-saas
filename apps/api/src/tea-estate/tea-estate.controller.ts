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
import { TeaEstateService } from './tea-estate.service.js';
import {
  CalculateGreenLeafIntakeDto,
  EvaluateLiquorQualityDto,
  CreateGreenLeafIntakeDto,
  CreateFactoryBatchDto,
  CreateAuctionLotDto,
  PlaceAuctionBidDto,
} from './dto/tea-estate.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';

@Controller('tea-estate')
export class TeaEstateController {
  constructor(private readonly teaService: TeaEstateService) {}

  @Get('stats/overview')
  async getOverviewStats() {
    const data = await this.teaService.getOverviewStats();
    return { success: true, data };
  }

  @Post('calculate/green-leaf-intake')
  @HttpCode(HttpStatus.OK)
  calculateGreenLeafIntake(@Body() dto: CalculateGreenLeafIntakeDto) {
    const data = this.teaService.calculateGreenLeafIntake(dto);
    return { success: true, data };
  }

  @Post('evaluate/liquor-quality')
  @HttpCode(HttpStatus.OK)
  evaluateLiquorQuality(@Body() dto: EvaluateLiquorQualityDto) {
    const data = this.teaService.evaluateLiquorQuality(dto);
    return { success: true, data };
  }

  @Get('green-leaf/intakes')
  async getAllGreenLeafIntakes() {
    const data = await this.teaService.getAllGreenLeafIntakes();
    return { success: true, data };
  }

  @Post('green-leaf/intakes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  async createGreenLeafIntake(@Body() dto: CreateGreenLeafIntakeDto) {
    const data = await this.teaService.createGreenLeafIntake(dto);
    return { success: true, data };
  }

  @Get('factory/batches')
  async getAllFactoryBatches() {
    const data = await this.teaService.getAllFactoryBatches();
    return { success: true, data };
  }

  @Post('factory/batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  async createFactoryBatch(@Body() dto: CreateFactoryBatchDto) {
    const data = await this.teaService.createFactoryBatch(dto);
    return { success: true, data };
  }

  @Get('auction/lots')
  async getAllAuctionLots() {
    const data = await this.teaService.getAllAuctionLots();
    return { success: true, data };
  }

  @Post('auction/lots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  async createAuctionLot(@Body() dto: CreateAuctionLotDto) {
    const data = await this.teaService.createAuctionLot(dto);
    return { success: true, data };
  }

  @Post('auction/lots/:id/bid')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  async placeAuctionBid(
    @Param('id') id: string,
    @Body() dto: PlaceAuctionBidDto,
  ) {
    const data = await this.teaService.placeAuctionBid(id, dto);
    return { success: true, data };
  }
}
