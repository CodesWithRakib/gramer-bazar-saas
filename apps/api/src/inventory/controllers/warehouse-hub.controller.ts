import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { WarehouseHubService } from '../services/warehouse-hub.service.js';
import {
  CreateWarehouseHubDto,
  AllocateHubStockDto,
  CreateStockTransferDto,
  UpdateStockTransferStatusDto,
} from '../dto/warehouse-hub.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';
import { StockTransferStatus } from '../entities/stock-transfer.entity.js';

@ApiTags('Warehouses & Multi-Hub Logistics')
@Controller('warehouses')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WarehouseHubController {
  constructor(private readonly hubService: WarehouseHubService) {}

  @Get('hubs')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'List distribution warehouse hubs' })
  @ApiQuery({ name: 'division', required: false })
  @ApiQuery({ name: 'district', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAllHubs(
    @Query('division') division?: string,
    @Query('district') district?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.hubService.findAllHubs({ division, district, isActive });
  }

  @Post('hubs')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new regional warehouse hub' })
  createHub(@Body() dto: CreateWarehouseHubDto) {
    return this.hubService.createHub(dto);
  }

  @Get('hubs/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'Get details of a warehouse hub' })
  findOneHub(@Param('id', ParseUUIDPipe) id: string) {
    return this.hubService.findOneHub(id);
  }

  @Get('hubs/:id/stocks')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'List inventory stock levels at a specific warehouse hub' })
  getHubStocks(@Param('id', ParseUUIDPipe) id: string) {
    return this.hubService.getHubStocks(id);
  }

  @Post('hubs/:id/stocks')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiOperation({ summary: 'Allocate or adjust product stock at a specific warehouse hub' })
  allocateStock(
    @Param('id', ParseUUIDPipe) hubId: string,
    @Body() dto: AllocateHubStockDto,
  ) {
    return this.hubService.allocateStock(hubId, dto);
  }

  @Get('transfers')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List stock transfers between warehouse hubs' })
  @ApiQuery({ name: 'hubId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: StockTransferStatus })
  listTransfers(
    @Query('hubId') hubId?: string,
    @Query('status') status?: StockTransferStatus,
  ) {
    return this.hubService.listTransfers({ hubId, status });
  }

  @Post('transfers')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Initiate a stock transfer between warehouse hubs' })
  createTransfer(@Body() dto: CreateStockTransferDto) {
    return this.hubService.createTransfer(dto);
  }

  @Patch('transfers/:id/status')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update transfer status (dispatch, receive, cancel)' })
  updateTransferStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockTransferStatusDto,
  ) {
    return this.hubService.updateTransferStatus(id, dto.status, dto.notes);
  }
}
