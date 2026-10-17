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
import { SpiceMarketService } from './spice-market.service.js';
import {
  SpiceType,
  SpiceRegion,
  DryingBatchStatus,
  SpicePurityGrade,
  SpiceLotStatus,
} from './enums/spice-market.enum.js';
import {
  CalculateSpiceDehydrationDto,
  EvaluateSpicePurityDto,
  CreateSpiceDryingBatchDto,
  UpdateBatchTelemetryDto,
  CreateSpicePurityLabTestDto,
  CreateSpiceForwardLotDto,
  PurchaseSpiceLotDto,
} from './dto/spice-market.dto.js';

@Controller('spice-market')
export class SpiceMarketController {
  constructor(private readonly spiceService: SpiceMarketService) {}

  @Post('calculator/dehydration')
  calculateSpiceDehydration(@Body() dto: CalculateSpiceDehydrationDto) {
    return this.spiceService.calculateSpiceDehydration(dto);
  }

  @Post('calculator/purity')
  evaluateSpicePurity(@Body() dto: EvaluateSpicePurityDto) {
    return this.spiceService.evaluateSpicePurity(dto);
  }

  @Get('drying-batches')
  getDryingBatches(
    @Query('spiceType') spiceType?: SpiceType,
    @Query('region') region?: SpiceRegion,
    @Query('status') status?: DryingBatchStatus,
  ) {
    return this.spiceService.getDryingBatches(spiceType, region, status);
  }

  @Get('drying-batches/:id')
  getDryingBatchById(@Param('id') id: string) {
    return this.spiceService.getDryingBatchById(id);
  }

  @Post('drying-batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  createDryingBatch(@Body() dto: CreateSpiceDryingBatchDto) {
    return this.spiceService.createDryingBatch(dto);
  }

  @Patch('drying-batches/:id/telemetry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  updateBatchTelemetry(
    @Param('id') id: string,
    @Body() dto: UpdateBatchTelemetryDto,
  ) {
    return this.spiceService.updateBatchTelemetry(id, dto);
  }

  @Get('lab-tests')
  getLabTests(
    @Query('spiceType') spiceType?: SpiceType,
    @Query('purityGrade') purityGrade?: SpicePurityGrade,
  ) {
    return this.spiceService.getLabTests(spiceType, purityGrade);
  }

  @Get('lab-tests/:id')
  getLabTestById(@Param('id') id: string) {
    return this.spiceService.getLabTestById(id);
  }

  @Post('lab-tests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  createLabTest(@Body() dto: CreateSpicePurityLabTestDto) {
    return this.spiceService.createLabTest(dto);
  }

  @Get('forward-lots')
  getForwardLots(
    @Query('spiceType') spiceType?: SpiceType,
    @Query('region') region?: SpiceRegion,
    @Query('status') status?: SpiceLotStatus,
  ) {
    return this.spiceService.getForwardLots(spiceType, region, status);
  }

  @Get('forward-lots/:id')
  getForwardLotById(@Param('id') id: string) {
    return this.spiceService.getForwardLotById(id);
  }

  @Post('forward-lots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  createForwardLot(@Body() dto: CreateSpiceForwardLotDto) {
    return this.spiceService.createForwardLot(dto);
  }

  @Post('forward-lots/:id/purchase')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  purchaseSpiceLot(
    @Param('id') id: string,
    @Body() dto: PurchaseSpiceLotDto,
  ) {
    return this.spiceService.purchaseSpiceLot(id, dto);
  }
}
