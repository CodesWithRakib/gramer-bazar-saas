import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductRequestsService } from './product-requests.service.js';
import { CreateProductRequestDto } from './dto/create-product-request.dto.js';
import { UpdateProductRequestStatusDto } from './dto/update-product-request-status.dto.js';
import { ProductRequestResponseDto } from './dto/product-request-response.dto.js';
import {
  ApiStandardResponse,
  ApiStandardPaginatedResponse,
  ApiCommonErrors,
} from '../common/decorators/api-standard-response.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { ProductRequestStatus } from './enums/product-request-status.enum.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';

@ApiTags('Product Requests')
@Controller()
export class ProductRequestsController {
  constructor(
    private readonly productRequestsService: ProductRequestsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  // --- Customer Endpoints ---

  @Post('product-requests')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Submit custom item procurement request (Customer)',
    description: 'Allows customers to request products not currently available in the marketplace.',
  })
  @ApiStandardResponse({
    type: ProductRequestResponseDto,
    status: HttpStatus.CREATED,
    description: 'Product request submitted successfully',
  })
  @ApiCommonErrors([400, 401, 500])
  create(@Request() req: any, @Body() createDto: CreateProductRequestDto) {
    return this.productRequestsService.create(req.user.id, createDto);
  }

  @Get('product-requests')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List own product requests (Customer)',
    description: 'Returns all custom procurement requests submitted by the authenticated user.',
  })
  @ApiStandardResponse({
    type: ProductRequestResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of customer requests',
  })
  @ApiCommonErrors([401, 500])
  findAllCustomer(@Request() req: any) {
    return this.productRequestsService.findAllCustomer(req.user.id);
  }

  @Get('product-requests/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Retrieve single product request details (Customer)',
    description: 'Returns status and fulfillment notes for user request.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Product request UUID' })
  @ApiStandardResponse({
    type: ProductRequestResponseDto,
    status: HttpStatus.OK,
    description: 'Product request details',
  })
  @ApiCommonErrors([401, 404, 500])
  findOneCustomer(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.productRequestsService.findOneCustomer(req.user.id, id);
  }

  // --- Admin Endpoints ---

  @Get('admin/product-requests')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'List all product requests for fulfillment (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Returns paginated customer product procurement requests.',
  })
  @ApiQuery({ name: 'status', required: false, enum: ProductRequestStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiStandardPaginatedResponse(ProductRequestResponseDto, {
    description: 'Paginated customer procurement requests queue',
  })
  @ApiCommonErrors([401, 403, 500])
  findAllAdmin(
    @Query('status') status?: ProductRequestStatus,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productRequestsService.findAllAdmin(status, search, page, limit);
  }

  @Get('admin/product-requests/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get product request details (Admin only)',
    description: 'Returns complete request audit trail and fulfillment options.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Product request UUID' })
  @ApiStandardResponse({
    type: ProductRequestResponseDto,
    status: HttpStatus.OK,
    description: 'Product request details',
  })
  @ApiCommonErrors([401, 403, 404, 500])
  findOneAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.productRequestsService.findOneAdmin(id);
  }

  @Patch('admin/product-requests/:id/status')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update product request fulfillment status (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Advances request status (e.g. IN_REVIEW, SOURCED, FULFILLED, REJECTED) and optionally links master catalog product.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Product request UUID' })
  @ApiStandardResponse({
    type: ProductRequestResponseDto,
    status: HttpStatus.OK,
    description: 'Product request status updated',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  async updateStatus(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductRequestStatusDto,
  ) {
    const result = await this.productRequestsService.updateStatus(
      id,
      req.user.id,
      updateDto,
    );
    await this.auditLogsService.record({
      actorId: req.user?.id,
      actorName: `${req.user?.firstName ?? ''} ${req.user?.lastName ?? ''}`.trim() || null,
      action: 'PRODUCT_REQUEST_STATUS_UPDATED',
      targetType: 'ProductRequest',
      targetId: id,
      details: `Status set to ${updateDto.status}`,
    });
    return result;
  }
}
