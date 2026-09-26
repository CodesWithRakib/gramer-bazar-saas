import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Query,
  Patch,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { TransitionOrderDto } from './dto/transition-order.dto.js';
import {
  OrderResponseDto,
  CheckoutResponseDto,
  UpdateOrderStatusDto,
} from './dto/order-response.dto.js';
import {
  ApiStandardResponse,
  ApiStandardPaginatedResponse,
  ApiCommonErrors,
} from '../common/decorators/api-standard-response.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Post('checkout')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Process checkout, deduct stock, and initiate order',
    description: 'Requires customer authentication. Validates cart items, applies delivery fees, records initial state, and returns order plus gateway paymentUrl (if digital payment).',
  })
  @ApiStandardResponse({
    type: CheckoutResponseDto,
    status: HttpStatus.CREATED,
    description: 'Order created successfully; payment URL returned if applicable',
  })
  @ApiCommonErrors([400, 401, 500])
  async checkout(@Request() req: any, @Body() checkoutDto: CheckoutDto) {
    const originUrl = req.headers.origin || req.headers.referer || 'http://localhost:3000';
    const baseUrl = originUrl.replace(/\/$/, '');
    const lang = checkoutDto.lang || 'en';
    const redirectUrl = `${baseUrl}/${lang}/customer/checkout`;
    return this.ordersService.checkout(req.user.id, checkoutDto, redirectUrl);
  }

  @Get('admin/all')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'List all platform orders with search (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Returns paginated marketplace orders with customer and address details.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'GBZ' })
  @ApiStandardPaginatedResponse(OrderResponseDto, {
    description: 'Paginated platform orders',
  })
  @ApiCommonErrors([401, 403, 500])
  async getAllOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.ordersService.findAll(page, limit, search);
  }

  @Patch('admin/:id/status')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Manually override order status (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Updates order status and logs audit event.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Order UUID' })
  @ApiStandardResponse({
    type: OrderResponseDto,
    status: HttpStatus.OK,
    description: 'Order status updated',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  async updateAdminOrderStatus(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const result = await this.ordersService.updateAdminOrderStatus(id, dto.status, req.user.id);
    await this.auditLogsService.record({
      actorId: req.user?.id,
      actorName: `${req.user?.firstName ?? ''} ${req.user?.lastName ?? ''}`.trim() || null,
      action: 'ORDER_STATUS_UPDATED',
      targetType: 'Order',
      targetId: id,
      details: `Status set to ${dto.status}`,
    });
    return result;
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List own orders for authenticated customer',
    description: 'Returns all orders placed by the current customer, sorted newest first.',
  })
  @ApiStandardResponse({
    type: OrderResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of customer orders',
  })
  @ApiCommonErrors([401, 500])
  async getMyOrders(@Request() req: any) {
    return this.ordersService.findCustomerOrders(req.user.id);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Retrieve single order details',
    description: 'Returns complete order items, delivery address, payments, and history if order belongs to customer.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Order UUID' })
  @ApiStandardResponse({
    type: OrderResponseDto,
    status: HttpStatus.OK,
    description: 'Order details',
  })
  @ApiCommonErrors([401, 404, 500])
  async getOrderById(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findCustomerOrderById(req.user.id, id);
  }

  @Post(':id/cancel')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Cancel an order before dispatch',
    description: 'Allows customer to cancel a pending order. Restores inventory and records cancellation reason.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Order UUID' })
  @ApiStandardResponse({
    type: OrderResponseDto,
    status: HttpStatus.OK,
    description: 'Order cancelled successfully',
  })
  @ApiCommonErrors([400, 401, 404, 500])
  async cancelOrder(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.cancelOrder(req.user.id, id);
  }

  @Post(':id/transition')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.RIDER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Transition order state via authoritative state machine',
    description: 'Validates state machine transitions (e.g. CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED) based on actor role.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Order UUID' })
  @ApiStandardResponse({
    type: OrderResponseDto,
    status: HttpStatus.OK,
    description: 'Order transitioned to target state',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  async transitionOrder(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransitionOrderDto,
  ) {
    const userRoles = (req.user?.roles || []).map((r: any) =>
      typeof r === 'string' ? r : r.name,
    );

    const result = await this.ordersService.transitionOrder(id, dto, {
      id: req.user.id,
      roles: userRoles,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    await this.auditLogsService.record({
      actorId: req.user?.id,
      actorName: `${req.user?.firstName ?? ''} ${req.user?.lastName ?? ''}`.trim() || null,
      action: 'ORDER_STATE_TRANSITION',
      targetType: 'Order',
      targetId: id,
      details: `Transitioned to ${dto.targetStatus}. Reason: ${dto.reason || 'None provided'}`,
    });

    return result;
  }
}
