import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { AgentCommerceService } from './agent-commerce.service.js';
import {
  OpenDrawerDto,
  CloseDrawerDto,
  RecordCashTxDto,
  CreateFarmerCollectionDto,
  UpdateFarmerCollectionStatusDto,
  CreateSettlementDto,
  ReviewSettlementDto,
  AgentPosCheckoutDto,
} from './dto/agent-commerce.dto.js';
import { SettlementStatus } from './enums/agent-commerce.enum.js';

@ApiTags('Agent Commerce & Field POS')
@ApiBearerAuth()
@Controller('agent-commerce')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgentCommerceController {
  constructor(private readonly agentCommerceService: AgentCommerceService) {}

  @Get('pos/active-session')
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get active cash drawer session for authenticated agent/seller' })
  async getActiveSession(@Req() req: any) {
    const session = await this.agentCommerceService.getActiveSession(req.user.id);
    return { success: true, data: session };
  }

  @Post('pos/open-session')
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Open a new cash drawer session' })
  async openDrawerSession(@Req() req: any, @Body() dto: OpenDrawerDto) {
    const session = await this.agentCommerceService.openDrawerSession(req.user.id, dto);
    return { success: true, data: session };
  }

  @Post('pos/close-session')
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Close and reconcile active cash drawer session' })
  async closeDrawerSession(@Req() req: any, @Body() dto: CloseDrawerDto) {
    const session = await this.agentCommerceService.closeDrawerSession(req.user.id, dto);
    return { success: true, data: session };
  }

  @Post('pos/transaction')
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Record manual or automated cash movement in drawer' })
  async recordCashTransaction(@Req() req: any, @Body() dto: RecordCashTxDto) {
    const tx = await this.agentCommerceService.recordCashTransaction(req.user.id, dto);
    return { success: true, data: tx };
  }

  @Post('pos/checkout')
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Process assisted POS Cash Order with live drawer update and change calculation' })
  async processAgentPosCheckout(
    @Req() req: any,
    @Body() dto: AgentPosCheckoutDto,
    @Headers('origin') origin?: string,
  ) {
    const result = await this.agentCommerceService.processAgentPosCheckout(
      req.user.id,
      dto,
      origin || 'http://localhost:3000',
    );
    return { success: true, data: result };
  }

  @Post('collections')
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Record remote farmer produce collection with optional cash drawer payout' })
  async recordFarmerCollection(@Req() req: any, @Body() dto: CreateFarmerCollectionDto) {
    const collection = await this.agentCommerceService.recordFarmerCollection(req.user.id, dto);
    return { success: true, data: collection };
  }

  @Get('collections/my-collections')
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all farmer produce collections by this agent' })
  async getFarmerCollections(@Req() req: any) {
    const collections = await this.agentCommerceService.getFarmerCollections(req.user.id);
    return { success: true, data: collections };
  }

  @Patch('collections/:id/status')
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update consignment/transfer status of a farmer collection' })
  async updateCollectionStatus(
    @Param('id') id: string,
    @Body() dto: UpdateFarmerCollectionStatusDto,
  ) {
    const updated = await this.agentCommerceService.updateCollectionStatus(id, dto.status);
    return { success: true, data: updated };
  }

  @Post('settlements')
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Submit cash deposit settlement to Upazila Post Office or MFI' })
  async createCashSettlement(@Req() req: any, @Body() dto: CreateSettlementDto) {
    const settlement = await this.agentCommerceService.createCashSettlement(req.user.id, dto);
    return { success: true, data: settlement };
  }

  @Get('settlements/my-settlements')
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all cash settlements submitted by this agent' })
  async getAgentSettlements(@Req() req: any) {
    const settlements = await this.agentCommerceService.getAgentSettlements(req.user.id);
    return { success: true, data: settlements };
  }

  @Get('summary')
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get comprehensive agent performance and drawer summary' })
  async getAgentPerformanceSummary(@Req() req: any) {
    const summary = await this.agentCommerceService.getAgentPerformanceSummary(req.user.id);
    return { success: true, data: summary };
  }

  // --- Admin Governance Endpoints ---

  @Get('admin/settlements')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: List all nationwide agent cash settlements' })
  @ApiQuery({ name: 'status', enum: SettlementStatus, required: false })
  async getAllSettlementsAdmin(@Query('status') status?: SettlementStatus) {
    const settlements = await this.agentCommerceService.getAllSettlementsAdmin(status);
    return { success: true, data: settlements };
  }

  @Patch('admin/settlements/:id/review')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Verify or reject an agent cash deposit voucher' })
  async reviewSettlementAdmin(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: ReviewSettlementDto,
  ) {
    const updated = await this.agentCommerceService.reviewSettlementAdmin(id, req.user.id, dto);
    return { success: true, data: updated };
  }

  @Get('admin/active-sessions')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: List all currently open agent cash drawer sessions' })
  async getAdminActiveSessions() {
    const sessions = await this.agentCommerceService.getAdminActiveSessions();
    return { success: true, data: sessions };
  }
}
