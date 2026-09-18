import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Process checkout and create order' })
  async checkout(@Request() req: any, @Body() checkoutDto: CheckoutDto) {
    return this.ordersService.checkout(req.user.id, checkoutDto);
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
}
