import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { InventoryService } from './inventory.service.js';
import { CreateInventoryDto } from '../dto/create-inventory.dto.js';
import { UpdateInventoryDto } from '../dto/update-inventory.dto.js';
import { InventorySummaryDto } from '../dto/seller-product-response.dto.js';
import { MessageResponseDto } from '../../common/dto/api-response.dto.js';
import {
  ApiStandardResponse,
  ApiStandardMessageResponse,
  ApiCommonErrors,
} from '../../common/decorators/api-standard-response.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';

@ApiTags('Inventory - Stock')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Initialize inventory stock record',
    description: 'Requires SELLER or ADMIN role. Establishes stock balance and threshold alerts for a product.',
  })
  @ApiStandardResponse({
    type: InventorySummaryDto,
    status: HttpStatus.CREATED,
    description: 'Inventory initialized successfully',
  })
  @ApiCommonErrors([400, 401, 403, 500])
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all inventory balances',
    description: 'Returns all inventory records across products.',
  })
  @ApiStandardResponse({
    type: InventorySummaryDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of inventory records',
  })
  @ApiCommonErrors([500])
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve single inventory balance by UUID',
    description: 'Returns available and reserved quantities for an inventory record.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Inventory UUID' })
  @ApiStandardResponse({
    type: InventorySummaryDto,
    status: HttpStatus.OK,
    description: 'Inventory record',
  })
  @ApiCommonErrors([404, 500])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Adjust inventory stock quantities and thresholds',
    description: 'Requires SELLER or ADMIN role. Updates stock count, reserved quantity, or threshold values.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Inventory UUID' })
  @ApiStandardResponse({
    type: InventorySummaryDto,
    status: HttpStatus.OK,
    description: 'Inventory updated successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete inventory record (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Deletes inventory entity.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Inventory UUID' })
  @ApiStandardMessageResponse({
    status: HttpStatus.OK,
    description: 'Inventory deleted successfully',
  })
  @ApiCommonErrors([401, 403, 404, 500])
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.remove(id);
  }
}
