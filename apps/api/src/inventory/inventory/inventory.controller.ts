import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
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
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.js';
import { toActor } from '../../common/utils/actor.js';

@ApiTags('Inventory - Stock')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth('JWT-auth')
  @Permissions('inventory.update')
  @ApiOperation({
    summary: 'Initialize inventory stock record',
    description:
      'Requires SELLER or ADMIN role. Establishes stock balance and threshold alerts for a product.',
  })
  @ApiStandardResponse({
    type: InventorySummaryDto,
    status: HttpStatus.CREATED,
    description: 'Inventory initialized successfully',
  })
  @ApiCommonErrors([400, 401, 403, 500])
  create(@Request() req: AuthenticatedRequest, @Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto, toActor(req));
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
  findAll(@Request() req: AuthenticatedRequest) {
    return this.inventoryService.findAll(toActor(req));
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
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth('JWT-auth')
  @Permissions('inventory.update')
  @ApiOperation({
    summary: 'Adjust inventory stock quantities and thresholds',
    description:
      'Requires SELLER or ADMIN role. Updates stock count, reserved quantity, or threshold values.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Inventory UUID' })
  @ApiStandardResponse({
    type: InventorySummaryDto,
    status: HttpStatus.OK,
    description: 'Inventory updated successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, updateInventoryDto, toActor(req));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Permissions('inventory.update')
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
