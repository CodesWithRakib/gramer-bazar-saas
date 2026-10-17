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
import { EdibleOilService } from './edible-oil.service.js';
import {
  OilSeedType,
  OilRegion,
  PressingBatchStatus,
  OilPurityGrade,
  OilLotStatus,
} from './enums/edible-oil.enum.js';
import {
  CalculateOilExtractionDto,
  EvaluateOilPurityDto,
  CreateGhaniPressingBatchDto,
  UpdateBatchExtractionDto,
  CreateOilPurityLabTestDto,
  CreateArtisanalOilLotDto,
  PurchaseOilLotDto,
} from './dto/edible-oil.dto.js';

@Controller('edible-oil')
export class EdibleOilController {
  constructor(private readonly oilService: EdibleOilService) {}

  @Post('calculator/extraction')
  calculateOilExtraction(@Body() dto: CalculateOilExtractionDto) {
    return this.oilService.calculateOilExtraction(dto);
  }

  @Post('calculator/purity')
  evaluateOilPurity(@Body() dto: EvaluateOilPurityDto) {
    return this.oilService.evaluateOilPurity(dto);
  }

  @Get('pressing-batches')
  getGhaniBatches(
    @Query('seedType') seedType?: OilSeedType,
    @Query('region') region?: OilRegion,
    @Query('status') status?: PressingBatchStatus,
  ) {
    return this.oilService.getGhaniBatches({ seedType, region, status });
  }

  @Get('pressing-batches/:id')
  getGhaniBatchById(@Param('id') id: string) {
    return this.oilService.getGhaniBatchById(id);
  }

  @Post('pressing-batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  createGhaniBatch(@Body() dto: CreateGhaniPressingBatchDto) {
    return this.oilService.createGhaniBatch(dto);
  }

  @Patch('pressing-batches/:id/extraction')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  updateBatchExtraction(
    @Param('id') id: string,
    @Body() dto: UpdateBatchExtractionDto,
  ) {
    return this.oilService.updateBatchExtraction(id, dto);
  }

  @Get('lab-tests')
  getOilLabTests(
    @Query('seedType') seedType?: OilSeedType,
    @Query('purityGrade') purityGrade?: OilPurityGrade,
  ) {
    return this.oilService.getOilLabTests({ seedType, purityGrade });
  }

  @Get('lab-tests/:id')
  getOilLabTestById(@Param('id') id: string) {
    return this.oilService.getOilLabTestById(id);
  }

  @Post('lab-tests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  createOilLabTest(@Body() dto: CreateOilPurityLabTestDto) {
    return this.oilService.createOilLabTest(dto);
  }

  @Get('artisanal-lots')
  getArtisanalOilLots(
    @Query('seedType') seedType?: OilSeedType,
    @Query('region') region?: OilRegion,
    @Query('status') status?: OilLotStatus,
  ) {
    return this.oilService.getArtisanalOilLots({ seedType, region, status });
  }

  @Get('artisanal-lots/:id')
  getArtisanalOilLotById(@Param('id') id: string) {
    return this.oilService.getArtisanalOilLotById(id);
  }

  @Post('artisanal-lots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  createArtisanalOilLot(@Body() dto: CreateArtisanalOilLotDto) {
    return this.oilService.createArtisanalOilLot(dto);
  }

  @Post('artisanal-lots/:id/purchase')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  purchaseOilLot(
    @Param('id') id: string,
    @Body() dto: PurchaseOilLotDto,
  ) {
    return this.oilService.purchaseOilLot(id, dto);
  }
}
