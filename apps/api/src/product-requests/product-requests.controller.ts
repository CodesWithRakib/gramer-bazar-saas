import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductRequestsService } from './product-requests.service.js';
import { CreateProductRequestDto } from './dto/create-product-request.dto.js';
import { UpdateProductRequestStatusDto } from './dto/update-product-request-status.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { ProductRequestStatus } from './enums/product-request-status.enum.js';

@ApiTags('Product Requests')
@Controller()
export class ProductRequestsController {
  constructor(private readonly productRequestsService: ProductRequestsService) {}

  // --- Customer Endpoints ---

  @Post('product-requests')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new product request (Customer)' })
  create(@Request() req: any, @Body() createDto: CreateProductRequestDto) {
    return this.productRequestsService.create(req.user.id, createDto);
  }

  @Get('product-requests')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all product requests for current user (Customer)' })
  findAllCustomer(@Request() req: any) {
    return this.productRequestsService.findAllCustomer(req.user.id);
  }

  @Get('product-requests/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get details of a specific product request (Customer)' })
  findOneCustomer(@Request() req: any, @Param('id') id: string) {
    return this.productRequestsService.findOneCustomer(req.user.id, id);
  }

  // --- Admin Endpoints ---

  @Get('admin/product-requests')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all product requests (Admin)' })
  findAllAdmin(
    @Query('status') status?: ProductRequestStatus,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productRequestsService.findAllAdmin(status, search, page, limit);
  }

  @Get('admin/product-requests/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get details of a product request (Admin)' })
  findOneAdmin(@Param('id') id: string) {
    return this.productRequestsService.findOneAdmin(id);
  }

  @Patch('admin/product-requests/:id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update product request status (Admin)' })
  updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateProductRequestStatusDto,
  ) {
    return this.productRequestsService.updateStatus(id, req.user.id, updateDto);
  }
}
