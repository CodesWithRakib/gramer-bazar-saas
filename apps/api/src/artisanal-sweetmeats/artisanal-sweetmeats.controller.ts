import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { ArtisanalSweetmeatsService } from './artisanal-sweetmeats.service.js';
import {
  SweetmeatType,
  SweetmeatRegion,
  SweetmeatPurityGrade,
  SweetmeatLotStatus,
} from './enums/artisanal-sweetmeats.enum.js';
import {
  CalculateSweetmeatYieldDto,
  EvaluateSweetmeatPurityDto,
  CreateChhanaProductionBatchDto,
  UpdateBatchCookingDto,
  CreateSweetmeatPurityLabTestDto,
  CreateArtisanalSweetmeatLotDto,
  PurchaseSweetmeatLotDto,
} from './dto/artisanal-sweetmeats.dto.js';

@Controller('artisanal-sweetmeats')
export class ArtisanalSweetmeatsController {
  constructor(private readonly sweetmeatService: ArtisanalSweetmeatsService) {}

  @Post('calculator/yield')
  calculateSweetmeatYield(@Body() dto: CalculateSweetmeatYieldDto) {
    return this.sweetmeatService.calculateSweetmeatYield(dto);
  }

  @Post('calculator/purity')
  evaluateSweetmeatPurity(@Body() dto: EvaluateSweetmeatPurityDto) {
    return this.sweetmeatService.evaluateSweetmeatPurity(dto);
  }

  @Get('production-batches')
  getProductionBatches(
    @Query('sweetmeatType') sweetmeatType?: SweetmeatType,
    @Query('region') region?: SweetmeatRegion,
  ) {
    return this.sweetmeatService.getProductionBatches({ sweetmeatType, region });
  }

  @Get('production-batches/:id')
  getProductionBatchById(@Param('id') id: string) {
    return this.sweetmeatService.getProductionBatchById(id);
  }

  @Post('production-batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  createProductionBatch(@Body() dto: CreateChhanaProductionBatchDto) {
    return this.sweetmeatService.createProductionBatch(dto);
  }

  @Patch('production-batches/:id/cooking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  updateBatchCooking(
    @Param('id') id: string,
    @Body() dto: UpdateBatchCookingDto,
  ) {
    return this.sweetmeatService.updateBatchCooking(id, dto);
  }

  @Get('lab-tests')
  getSweetmeatLabTests(
    @Query('sweetmeatType') sweetmeatType?: SweetmeatType,
    @Query('purityGrade') purityGrade?: SweetmeatPurityGrade,
  ) {
    return this.sweetmeatService.getSweetmeatLabTests({ sweetmeatType, purityGrade });
  }

  @Get('lab-tests/:id')
  getSweetmeatLabTestById(@Param('id') id: string) {
    return this.sweetmeatService.getSweetmeatLabTestById(id);
  }

  @Post('lab-tests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  createSweetmeatLabTest(@Body() dto: CreateSweetmeatPurityLabTestDto) {
    return this.sweetmeatService.createSweetmeatLabTest(dto);
  }

  @Get('artisanal-lots')
  getArtisanalLots(
    @Query('sweetmeatType') sweetmeatType?: SweetmeatType,
    @Query('region') region?: SweetmeatRegion,
    @Query('status') status?: SweetmeatLotStatus,
  ) {
    return this.sweetmeatService.getArtisanalLots({ sweetmeatType, region, status });
  }

  @Get('artisanal-lots/:id')
  getArtisanalLotById(@Param('id') id: string) {
    return this.sweetmeatService.getArtisanalLotById(id);
  }

  @Post('artisanal-lots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  createArtisanalLot(@Body() dto: CreateArtisanalSweetmeatLotDto) {
    return this.sweetmeatService.createArtisanalLot(dto);
  }

  @Post('artisanal-lots/:id/purchase')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  purchaseSweetmeatLot(
    @Param('id') id: string,
    @Body() dto: PurchaseSweetmeatLotDto,
  ) {
    return this.sweetmeatService.purchaseSweetmeatLot(id, dto);
  }
}
