import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service.js';
import { CreateInventoryDto } from '../dto/create-inventory.dto.js';
import { UpdateInventoryDto } from '../dto/update-inventory.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create initial inventory (Usually done automatically via SellerProduct)' })
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory items' })
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an inventory item by ID' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update inventory levels' })
  update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete inventory record (Admin only)' })
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
