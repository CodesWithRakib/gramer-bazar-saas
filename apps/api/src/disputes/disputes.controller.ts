import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { DisputesService } from './disputes.service.js';
import { CreateDisputeDto } from './dto/create-dispute.dto.js';
import { AddDisputeMessageDto } from './dto/add-dispute-message.dto.js';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';

@Controller('disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  // Customer Routes
  @Post('customer')
  @Roles(Role.CUSTOMER)
  create(@Req() req: any, @Body() createDisputeDto: CreateDisputeDto) {
    return this.disputesService.createDispute(req.user.id, createDisputeDto);
  }

  @Get('customer')
  @Roles(Role.CUSTOMER)
  getCustomerDisputes(@Req() req: any) {
    return this.disputesService.getCustomerDisputes(req.user.id);
  }

  @Get('customer/:id')
  @Roles(Role.CUSTOMER)
  getCustomerDisputeDetails(@Param('id') id: string, @Req() req: any) {
    return this.disputesService.getDisputeDetails(id, req.user.id, 'customer');
  }

  @Post('customer/:id/messages')
  @Roles(Role.CUSTOMER)
  addCustomerMessage(@Param('id') id: string, @Req() req: any, @Body() dto: AddDisputeMessageDto) {
    return this.disputesService.addMessage(id, req.user.id, 'customer', dto);
  }

  // Seller Routes
  @Get('seller')
  @Roles(Role.SELLER)
  getSellerDisputes(@Req() req: any) {
    return this.disputesService.getSellerDisputes(req.user.id);
  }

  @Get('seller/:id')
  @Roles(Role.SELLER)
  getSellerDisputeDetails(@Param('id') id: string, @Req() req: any) {
    return this.disputesService.getDisputeDetails(id, req.user.id, 'seller');
  }

  @Post('seller/:id/messages')
  @Roles(Role.SELLER)
  addSellerMessage(@Param('id') id: string, @Req() req: any, @Body() dto: AddDisputeMessageDto) {
    return this.disputesService.addMessage(id, req.user.id, 'seller', dto);
  }

  // Admin Routes
  @Get('admin')
  @Roles(Role.ADMIN)
  getAdminDisputes() {
    return this.disputesService.getAdminDisputes();
  }

  @Get('admin/:id')
  @Roles(Role.ADMIN)
  getAdminDisputeDetails(@Param('id') id: string, @Req() req: any) {
    return this.disputesService.getDisputeDetails(id, req.user.id, 'admin');
  }

  @Post('admin/:id/messages')
  @Roles(Role.ADMIN)
  addAdminMessage(@Param('id') id: string, @Req() req: any, @Body() dto: AddDisputeMessageDto) {
    return this.disputesService.addMessage(id, req.user.id, 'admin', dto);
  }

  @Patch('admin/:id/resolve')
  @Roles(Role.ADMIN)
  resolveDispute(@Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return this.disputesService.resolveDispute(id, dto);
  }
}
