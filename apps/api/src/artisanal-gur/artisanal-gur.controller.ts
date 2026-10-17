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
import { ArtisanalGurService } from './artisanal-gur.service.js';
import {
  GurType,
  GurRegion,
  SapCollectionShift,
  GurPurityGrade,
  GurLotStatus,
} from './enums/artisanal-gur.enum.js';
import {
  CalculateGurExtractionDto,
  EvaluateGurPurityDto,
  CreateDatePalmTappingBatchDto,
  UpdateBatchBoilingDto,
  CreateGurPurityLabTestDto,
  CreateArtisanalGurLotDto,
  PurchaseGurLotDto,
} from './dto/artisanal-gur.dto.js';

@Controller('artisanal-gur')
export class ArtisanalGurController {
  constructor(private readonly gurService: ArtisanalGurService) {}

  @Post('calculator/extraction')
  calculateGurExtraction(@Body() dto: CalculateGurExtractionDto) {
    return this.gurService.calculateGurExtraction(dto);
  }

  @Post('calculator/purity')
  evaluateGurPurity(@Body() dto: EvaluateGurPurityDto) {
    return this.gurService.evaluateGurPurity(dto);
  }

  @Get('tapping-batches')
  getTappingBatches(
    @Query('gurType') gurType?: GurType,
    @Query('region') region?: GurRegion,
    @Query('shift') shift?: SapCollectionShift,
  ) {
    return this.gurService.getTappingBatches({ gurType, region, shift });
  }

  @Get('tapping-batches/:id')
  getTappingBatchById(@Param('id') id: string) {
    return this.gurService.getTappingBatchById(id);
  }

  @Post('tapping-batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  createTappingBatch(@Body() dto: CreateDatePalmTappingBatchDto) {
    return this.gurService.createTappingBatch(dto);
  }

  @Patch('tapping-batches/:id/boiling')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  updateBatchBoiling(
    @Param('id') id: string,
    @Body() dto: UpdateBatchBoilingDto,
  ) {
    return this.gurService.updateBatchBoiling(id, dto);
  }

  @Get('lab-tests')
  getGurLabTests(
    @Query('gurType') gurType?: GurType,
    @Query('purityGrade') purityGrade?: GurPurityGrade,
  ) {
    return this.gurService.getGurLabTests({ gurType, purityGrade });
  }

  @Get('lab-tests/:id')
  getGurLabTestById(@Param('id') id: string) {
    return this.gurService.getGurLabTestById(id);
  }

  @Post('lab-tests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  createGurLabTest(@Body() dto: CreateGurPurityLabTestDto) {
    return this.gurService.createGurLabTest(dto);
  }

  @Get('artisanal-lots')
  getArtisanalLots(
    @Query('gurType') gurType?: GurType,
    @Query('region') region?: GurRegion,
    @Query('status') status?: GurLotStatus,
  ) {
    return this.gurService.getArtisanalLots({ gurType, region, status });
  }

  @Get('artisanal-lots/:id')
  getArtisanalLotById(@Param('id') id: string) {
    return this.gurService.getArtisanalLotById(id);
  }

  @Post('artisanal-lots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  createArtisanalLot(@Body() dto: CreateArtisanalGurLotDto) {
    return this.gurService.createArtisanalLot(dto);
  }

  @Post('artisanal-lots/:id/purchase')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  purchaseGurLot(
    @Param('id') id: string,
    @Body() dto: PurchaseGurLotDto,
  ) {
    return this.gurService.purchaseGurLot(id, dto);
  }
}
