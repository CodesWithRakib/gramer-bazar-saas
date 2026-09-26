import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FlashSalesService } from './flash-sales.service.js';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto.js';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { ApiStandardResponse, ApiStandardPaginatedResponse, ApiStandardMessageResponse, ApiCommonErrors } from '../common/decorators/api-standard-response.decorator.js';
import { FlashSaleResponseDto } from './dto/flash-sale-response.dto.js';

@ApiTags('Flash Sales')
@Controller('flash-sales')
@ApiCommonErrors()
export class FlashSalesController {
  constructor(private readonly flashSalesService: FlashSalesService) {}

  @Get('active')
  @ApiOperation({ summary: 'Customer: Get currently active flash sales', description: 'Returns ongoing live flash campaigns with discounted deals.' })
  @ApiStandardResponse({ type: FlashSaleResponseDto, isArray: true, description: 'List of active flash sale events' })
  findAllActive() {
    return this.flashSalesService.findAllActive();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Create a flash sale', description: 'Creates a scheduled flash sale campaign with discounted inventory allocations.' })
  @ApiStandardResponse({ type: FlashSaleResponseDto, status: 201, description: 'Flash sale created successfully' })
  create(@Body() createDto: CreateFlashSaleDto) {
    return this.flashSalesService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get all flash sales', description: 'Paginated historical and upcoming flash promotions for management.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiStandardPaginatedResponse(FlashSaleResponseDto, { description: 'Paginated flash sales' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.flashSalesService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Public: Get a flash sale by ID', description: 'Returns details and item listings for a specific flash sale campaign.' })
  @ApiParam({ name: 'id', description: 'Flash sale UUID' })
  @ApiStandardResponse({ type: FlashSaleResponseDto, description: 'Flash sale details' })
  findOne(@Param('id') id: string) {
    return this.flashSalesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update a flash sale', description: 'Modifies duration, active flag, banner, or items of a flash sale.' })
  @ApiParam({ name: 'id', description: 'Flash sale UUID' })
  @ApiStandardResponse({ type: FlashSaleResponseDto, description: 'Flash sale updated successfully' })
  update(@Param('id') id: string, @Body() updateDto: UpdateFlashSaleDto) {
    return this.flashSalesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Delete a flash sale', description: 'Removes a flash sale promotion.' })
  @ApiParam({ name: 'id', description: 'Flash sale UUID' })
  @ApiStandardMessageResponse({ description: 'Flash sale removed successfully' })
  remove(@Param('id') id: string) {
    return this.flashSalesService.remove(id);
  }
}
