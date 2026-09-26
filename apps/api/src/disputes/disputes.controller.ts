import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { DisputesService } from './disputes.service.js';
import { CreateDisputeDto } from './dto/create-dispute.dto.js';
import { AddDisputeMessageDto } from './dto/add-dispute-message.dto.js';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { ApiStandardResponse, ApiCommonErrors } from '../common/decorators/api-standard-response.decorator.js';
import { DisputeResponseDto, DisputeMessageResponseDto } from './dto/dispute-response.dto.js';

@ApiTags('Disputes')
@Controller('disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiCommonErrors()
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  // Customer Routes
  @Post('customer')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Customer: Raise a new dispute for an order', description: 'Customer submits a dispute regarding an order with photographic evidence.' })
  @ApiStandardResponse({ type: DisputeResponseDto, status: 201, description: 'Dispute submitted successfully' })
  create(@Req() req: any, @Body() createDisputeDto: CreateDisputeDto) {
    return this.disputesService.createDispute(req.user.id, createDisputeDto);
  }

  @Get('customer')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Customer: List my disputes', description: 'Lists all disputes initiated by the authenticated customer.' })
  @ApiStandardResponse({ type: DisputeResponseDto, isArray: true, description: 'List of customer disputes' })
  getCustomerDisputes(@Req() req: any) {
    return this.disputesService.getCustomerDisputes(req.user.id);
  }

  @Get('customer/:id')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Customer: Get dispute details and conversation', description: 'Returns dispute details and discussion messages for the customer.' })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiStandardResponse({ type: DisputeResponseDto, description: 'Dispute details' })
  getCustomerDisputeDetails(@Param('id') id: string, @Req() req: any) {
    return this.disputesService.getDisputeDetails(id, req.user.id, 'customer');
  }

  @Post('customer/:id/messages')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Customer: Add message to dispute', description: 'Adds customer reply message to the dispute thread.' })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiStandardResponse({ type: DisputeMessageResponseDto, status: 201, description: 'Message added to dispute' })
  addCustomerMessage(@Param('id') id: string, @Req() req: any, @Body() dto: AddDisputeMessageDto) {
    return this.disputesService.addMessage(id, req.user.id, 'customer', dto);
  }

  // Seller Routes
  @Get('seller')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Seller: List disputes against my shop', description: 'Lists all customer disputes involving items sold by this seller.' })
  @ApiStandardResponse({ type: DisputeResponseDto, isArray: true, description: 'List of seller disputes' })
  getSellerDisputes(@Req() req: any) {
    return this.disputesService.getSellerDisputes(req.user.id);
  }

  @Get('seller/:id')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Seller: Get dispute details', description: 'Returns dispute information and message thread for seller review.' })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiStandardResponse({ type: DisputeResponseDto, description: 'Dispute details' })
  getSellerDisputeDetails(@Param('id') id: string, @Req() req: any) {
    return this.disputesService.getDisputeDetails(id, req.user.id, 'seller');
  }

  @Post('seller/:id/messages')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Seller: Add message to dispute', description: 'Adds seller response or counter-evidence to dispute thread.' })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiStandardResponse({ type: DisputeMessageResponseDto, status: 201, description: 'Message added to dispute' })
  addSellerMessage(@Param('id') id: string, @Req() req: any, @Body() dto: AddDisputeMessageDto) {
    return this.disputesService.addMessage(id, req.user.id, 'seller', dto);
  }

  // Admin Routes
  @Get('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: List all marketplace disputes', description: 'Lists all open and resolved dispute tickets across the entire platform.' })
  @ApiStandardResponse({ type: DisputeResponseDto, isArray: true, description: 'List of all disputes' })
  getAdminDisputes() {
    return this.disputesService.getAdminDisputes();
  }

  @Get('admin/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: Get full dispute details', description: 'Returns dispute evidence, audit trail, and full conversation history.' })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiStandardResponse({ type: DisputeResponseDto, description: 'Full dispute audit record' })
  getAdminDisputeDetails(@Param('id') id: string, @Req() req: any) {
    return this.disputesService.getDisputeDetails(id, req.user.id, 'admin');
  }

  @Post('admin/:id/messages')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: Post official mediation message', description: 'Appends official admin message into dispute resolution thread.' })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiStandardResponse({ type: DisputeMessageResponseDto, status: 201, description: 'Admin message posted' })
  addAdminMessage(@Param('id') id: string, @Req() req: any, @Body() dto: AddDisputeMessageDto) {
    return this.disputesService.addMessage(id, req.user.id, 'admin', dto);
  }

  @Patch('admin/:id/resolve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: Adjudicate and resolve dispute', description: 'Applies final administrative verdict (RESOLVED, REJECTED) with refund notes.' })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiStandardResponse({ type: DisputeResponseDto, description: 'Dispute resolution verdict saved' })
  resolveDispute(@Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return this.disputesService.resolveDispute(id, dto);
  }
}
