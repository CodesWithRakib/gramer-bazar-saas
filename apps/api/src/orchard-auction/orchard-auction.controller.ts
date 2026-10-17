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
import { OrchardAuctionService } from './orchard-auction.service.js';
import {
  FruitType,
  OrchardRegion,
  OrchardAuctionStatus,
  HwtTreatmentStatus,
} from './enums/orchard-auction.enum.js';
import {
  CalculateOrchardValuationDto,
  EvaluateHwtQuarantineDto,
  CreateOrchardAuctionLotDto,
  PlaceOrchardBidDto,
  CreatePhytosanitaryHwtBatchDto,
  CreateOrchardHarvestDispatchDto,
  UpdateDispatchColdChainDto,
} from './dto/orchard-auction.dto.js';

@Controller('orchard-auction')
export class OrchardAuctionController {
  constructor(private readonly orchardService: OrchardAuctionService) {}

  @Post('calculator/valuation')
  calculateOrchardValuation(@Body() dto: CalculateOrchardValuationDto) {
    return this.orchardService.calculateOrchardValuation(dto);
  }

  @Post('calculator/hwt-quarantine')
  evaluateHwtQuarantine(@Body() dto: EvaluateHwtQuarantineDto) {
    return this.orchardService.evaluateHwtQuarantine(dto);
  }

  @Get('lots')
  getAuctionLots(
    @Query('region') region?: OrchardRegion,
    @Query('fruitType') fruitType?: FruitType,
    @Query('status') status?: OrchardAuctionStatus,
  ) {
    return this.orchardService.getAuctionLots(region, fruitType, status);
  }

  @Get('lots/:id')
  getAuctionLotById(@Param('id') id: string) {
    return this.orchardService.getAuctionLotById(id);
  }

  @Post('lots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  createAuctionLot(@Body() dto: CreateOrchardAuctionLotDto) {
    return this.orchardService.createAuctionLot(dto);
  }

  @Post('lots/:id/bids')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  placeOrchardBid(@Param('id') id: string, @Body() dto: PlaceOrchardBidDto) {
    return this.orchardService.placeOrchardBid(id, dto);
  }

  @Get('hwt-batches')
  getHwtBatches(
    @Query('fruitType') fruitType?: FruitType,
    @Query('status') status?: HwtTreatmentStatus,
  ) {
    return this.orchardService.getHwtBatches(fruitType, status);
  }

  @Get('hwt-batches/:id')
  getHwtBatchById(@Param('id') id: string) {
    return this.orchardService.getHwtBatchById(id);
  }

  @Post('hwt-batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  createHwtBatch(@Body() dto: CreatePhytosanitaryHwtBatchDto) {
    return this.orchardService.createHwtBatch(dto);
  }

  @Get('dispatches')
  getDispatches(@Query('status') status?: string) {
    return this.orchardService.getDispatches(status);
  }

  @Get('dispatches/:id')
  getDispatchById(@Param('id') id: string) {
    return this.orchardService.getDispatchById(id);
  }

  @Post('dispatches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  createDispatch(@Body() dto: CreateOrchardHarvestDispatchDto) {
    return this.orchardService.createDispatch(dto);
  }

  @Patch('dispatches/:id/cold-chain')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RIDER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  updateDispatchColdChain(
    @Param('id') id: string,
    @Body() dto: UpdateDispatchColdChainDto,
  ) {
    return this.orchardService.updateDispatchColdChain(id, dto);
  }
}
