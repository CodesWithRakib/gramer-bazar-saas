import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveriesService } from './deliveries.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { AssignDeliveryDto } from './dto/assign-delivery.dto.js';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto.js';

@ApiTags('Deliveries')
@Controller('deliveries')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  // --- ADMIN ENDPOINTS ---

  @Get('admin')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Get all deliveries' })
  getAllDeliveries(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.deliveriesService.getAllDeliveries(page, limit, search);
  }

  @Post('admin/assign')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Assign an order to a rider' })
  assignDelivery(@Request() req: any, @Body() dto: AssignDeliveryDto) {
    return this.deliveriesService.assignDelivery(req.user.id, dto);
  }

  @Get('admin/riders')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Get list of riders' })
  getRiders() {
    return this.deliveriesService.getRiders();
  }

  // --- RIDER ENDPOINTS ---

  @Get('rider/assigned')
  @Roles(Role.RIDER)
  @ApiOperation({ summary: 'Rider: Get assigned deliveries' })
  getRiderDeliveries(@Request() req: any) {
    return this.deliveriesService.getRiderDeliveries(req.user.id);
  }

  @Get('rider/:id')
  @Roles(Role.RIDER)
  @ApiOperation({ summary: 'Rider: Get specific delivery details' })
  getDeliveryByIdForRider(@Request() req: any, @Param('id') id: string) {
    return this.deliveriesService.getDeliveryByIdForRider(req.user.id, id);
  }

  @Patch('rider/:id/status')
  @Roles(Role.RIDER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Rider/Admin: Update delivery status' })
  updateDeliveryStatus(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateDeliveryStatusDto) {
    const isAdmin = req.user.roles?.includes(Role.ADMIN) || req.user.roles?.includes(Role.SUPER_ADMIN);
    return this.deliveriesService.updateDeliveryStatus(req.user.id, id, dto, isAdmin);
  }

  // --- CUSTOMER ENDPOINTS ---

  @Get('customer/:orderId')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Customer: Get delivery tracking for an order' })
  getCustomerDelivery(@Request() req: any, @Param('orderId') orderId: string) {
    return this.deliveriesService.getCustomerDelivery(req.user.id, orderId);
  }
}
