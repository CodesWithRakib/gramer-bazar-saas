import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { DeliveriesService } from './deliveries.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { AssignDeliveryDto } from './dto/assign-delivery.dto.js';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto.js';
import { DeliveryResponseDto, RiderSummaryDto, UpdateRiderLocationDto } from './dto/delivery-response.dto.js';
import { ApiStandardResponse, ApiStandardPaginatedResponse, ApiCommonErrors } from '../common/decorators/api-standard-response.decorator.js';

@ApiTags('Deliveries')
@Controller('deliveries')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiCommonErrors()
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  // --- ADMIN ENDPOINTS ---

  @Get('admin')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Get all deliveries', description: 'Lists all system deliveries with pagination, search, and rider details.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Filter deliveries by order or rider keyword' })
  @ApiStandardPaginatedResponse(DeliveryResponseDto, { description: 'Paginated list of deliveries' })
  getAllDeliveries(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.deliveriesService.getAllDeliveries(page, limit, search);
  }

  @Post('admin/assign')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Assign an order to a rider', description: 'Assigns or re-assigns an order delivery to a specific registered rider.' })
  @ApiStandardResponse({ type: DeliveryResponseDto, status: 201, description: 'Order assigned to rider successfully' })
  assignDelivery(@Request() req: any, @Body() dto: AssignDeliveryDto) {
    return this.deliveriesService.assignDelivery(req.user.id, dto);
  }

  @Get('admin/riders')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Get list of riders', description: 'Returns a summary list of all available active riders for dispatch assignment.' })
  @ApiStandardResponse({ type: RiderSummaryDto, isArray: true, description: 'List of dispatchable riders' })
  getRiders() {
    return this.deliveriesService.getRiders();
  }

  // --- RIDER ENDPOINTS ---

  @Get('rider/assigned')
  @Roles(Role.RIDER)
  @ApiOperation({ summary: 'Rider: Get assigned deliveries', description: 'Retrieves all deliveries assigned to the currently logged in rider.' })
  @ApiStandardResponse({ type: DeliveryResponseDto, isArray: true, description: 'Assigned deliveries for authenticated rider' })
  getRiderDeliveries(@Request() req: any) {
    return this.deliveriesService.getRiderDeliveries(req.user.id);
  }

  @Get('rider/:id')
  @Roles(Role.RIDER)
  @ApiOperation({ summary: 'Rider: Get specific delivery details', description: 'Retrieves details for a specific delivery assigned to the rider.' })
  @ApiParam({ name: 'id', description: 'Delivery UUID' })
  @ApiStandardResponse({ type: DeliveryResponseDto, description: 'Delivery details' })
  getDeliveryByIdForRider(@Request() req: any, @Param('id') id: string) {
    return this.deliveriesService.getDeliveryByIdForRider(req.user.id, id);
  }

  @Patch('rider/:id/status')
  @Roles(Role.RIDER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Rider/Admin: Update delivery status', description: 'Updates status of delivery (e.g. PICKED_UP, OUT_FOR_DELIVERY, DELIVERED, FAILED).' })
  @ApiParam({ name: 'id', description: 'Delivery UUID' })
  @ApiStandardResponse({ type: DeliveryResponseDto, description: 'Delivery status updated successfully' })
  updateDeliveryStatus(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateDeliveryStatusDto) {
    const isAdmin = req.user.roles?.some((r: any) => (r.name || r) === Role.ADMIN || (r.name || r) === Role.SUPER_ADMIN);
    return this.deliveriesService.updateDeliveryStatus(req.user.id, id, dto, isAdmin);
  }

  @Patch('rider/:id/location')
  @Roles(Role.RIDER)
  @ApiOperation({ summary: 'Rider: Update live GPS location', description: 'Updates current geographic coordinates (lat/lng) of the delivery rider.' })
  @ApiParam({ name: 'id', description: 'Delivery UUID' })
  @ApiBody({ type: UpdateRiderLocationDto })
  @ApiStandardResponse({ type: DeliveryResponseDto, description: 'Rider coordinates updated successfully' })
  updateRiderLocation(
    @Request() req: any,
    @Param('id') id: string,
    @Body('lat') lat: number,
    @Body('lng') lng: number,
  ) {
    const parsedLat = parseFloat(lat as unknown as string);
    const parsedLng = parseFloat(lng as unknown as string);
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      throw new BadRequestException('lat and lng must be valid numbers');
    }
    return this.deliveriesService.updateRiderLocation(req.user.id, id, parsedLat, parsedLng);
  }

  // --- CUSTOMER ENDPOINTS ---

  @Get('customer/:orderId')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Customer: Get delivery tracking for an order', description: 'Customer tracking view of the delivery status and rider location for an order.' })
  @ApiParam({ name: 'orderId', description: 'Order UUID' })
  @ApiStandardResponse({ type: DeliveryResponseDto, description: 'Order delivery tracking details' })
  getCustomerDelivery(@Request() req: any, @Param('orderId') orderId: string) {
    return this.deliveriesService.getCustomerDelivery(req.user.id, orderId);
  }
}
