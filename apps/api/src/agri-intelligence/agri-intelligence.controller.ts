import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AgriIntelligenceService } from './agri-intelligence.service.js';
import {
  CreateMandiPriceDto,
  MandiPriceFilterDto,
} from './dto/mandi-price.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';

@ApiTags('Agri Intelligence & Mandi Spot Prices')
@Controller('agri-intelligence')
export class AgriIntelligenceController {
  constructor(private readonly agriService: AgriIntelligenceService) {}

  @Get('mandi-prices')
  @ApiOperation({ summary: 'Get agricultural mandi spot prices across Bangladesh' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'commodityGroup', required: false })
  @ApiQuery({ name: 'division', required: false })
  @ApiQuery({ name: 'district', required: false })
  getMandiPrices(@Query() filters: MandiPriceFilterDto) {
    return this.agriService.getMandiPrices(filters);
  }

  @Get('fair-price-advisory')
  @ApiOperation({ summary: 'Calculate fair pricing advisory for a crop against regional mandi benchmarks' })
  @ApiQuery({ name: 'cropName', required: true })
  @ApiQuery({ name: 'district', required: false })
  @ApiQuery({ name: 'offeredPrice', required: true, type: Number })
  getFairPriceAdvisory(
    @Query('cropName') cropName: string,
    @Query('offeredPrice') offeredPrice: number,
    @Query('district') district?: string,
  ) {
    return this.agriService.getFairPriceAdvisory({
      cropName,
      offeredPrice: Number(offeredPrice),
      district,
    });
  }

  @Post('mandi-prices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ingest or record daily mandi commodity wholesale rates' })
  recordMandiPrice(@Body() dto: CreateMandiPriceDto) {
    return this.agriService.recordMandiPrice(dto);
  }
}
