import { Controller, Post, Body, UseGuards, Request, Get, Param, Query, Patch } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { TransitionOrderDto } from './dto/transition-order.dto.js';
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Process checkout and create order' })
  async checkout(@Request() req: any, @Body() checkoutDto: CheckoutDto) {
    const originUrl = req.headers.origin || req.headers.referer || 'http://localhost:3000';
    const baseUrl = originUrl.replace(/\/$/, ''); // Remove trailing slash if any
    const lang = checkoutDto.lang || 'en';
    const redirectUrl = `${baseUrl}/${lang}/customer/checkout`;
    return this.ordersService.checkout(req.user.id, checkoutDto, redirectUrl);
  }

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  async getAllOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.ordersService.findAll(page, limit, search);
  }

  @Patch('admin/:id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  async updateAdminOrderStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    const result = await this.ordersService.updateAdminOrderStatus(id, status, req.user.id);
    await this.auditLogsService.record({
      actorId: req.user?.id,
      actorName: `${req.user?.firstName ?? ''} ${req.user?.lastName ?? ''}`.trim() || null,
      action: 'ORDER_STATUS_UPDATED',
      targetType: 'Order',
      targetId: id,
      details: `Status set to ${status}`,
    });
    return result;
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all orders for the current user' })
  async getMyOrders(@Request() req: any) {
    return this.ordersService.findCustomerOrders(req.user.id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get specific order details' })
  async getOrderById(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.findCustomerOrderById(req.user.id, id);
  }

  @Post(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel an order' })
  async cancelOrder(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.cancelOrder(req.user.id, id);
  }

  @Post(':id/transition')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.RIDER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Transition order state via authoritative state machine' })
  async transitionOrder(
    @Request() req: any,
    @Param('id') id: string,
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
