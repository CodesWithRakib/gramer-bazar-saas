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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { GroupBuyingService } from './group-buying.service.js';
import {
  CreateGroupBuyCampaignDto,
  UpdateGroupBuyCampaignDto,
  StartPoolDto,
  JoinPoolDto,
  QueryCampaignDto,
} from './dto/group-buying.dto.js';
import { GroupBuyPoolStatus } from './enums/group-buying.enum.js';

@ApiTags('Community Group Buying')
@Controller('group-buying')
export class GroupBuyingController {
  constructor(private readonly groupBuyingService: GroupBuyingService) {}

  // --- Public Endpoints ---

  @Get('campaigns')
  @ApiOperation({ summary: 'Get active community group buy campaigns with optional geographic filtering' })
  async getActiveCampaigns(@Query() query: QueryCampaignDto) {
    const campaigns = await this.groupBuyingService.getActiveCampaigns(query);
    return { success: true, data: campaigns };
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get single campaign details by ID' })
  async getCampaignById(@Param('id') id: string) {
    const campaign = await this.groupBuyingService.getCampaignById(id);
    return { success: true, data: campaign };
  }

  @Get('pools/code/:shareCode')
  @ApiOperation({ summary: 'Public: Lookup community pool by social share code (for WhatsApp & SMS invites)' })
  async getPoolByShareCode(@Param('shareCode') shareCode: string) {
    const pool = await this.groupBuyingService.getPoolByShareCode(shareCode);
    return { success: true, data: pool };
  }

  @Get('pools/:id')
  @ApiOperation({ summary: 'Get pool details by UUID' })
  async getPoolById(@Param('id') id: string) {
    const pool = await this.groupBuyingService.getPoolById(id);
    return { success: true, data: pool };
  }

  // --- Customer / User Authenticated Endpoints ---

  @Post('pools/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a new group buy pool as community leader' })
  async startPool(@Req() req: any, @Body() dto: StartPoolDto) {
    const pool = await this.groupBuyingService.startPool(req.user.id, dto);
    return { success: true, data: pool };
  }

  @Post('pools/:id/join')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join an active group buy pool with committed order' })
  async joinPool(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: JoinPoolDto,
  ) {
    const pool = await this.groupBuyingService.joinPool(req.user.id, id, dto);
    return { success: true, data: pool };
  }

  @Get('my-pools')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all group buy pools joined by authenticated customer' })
  async getMyPools(@Req() req: any) {
    const pools = await this.groupBuyingService.getMyPools(req.user.id);
    return { success: true, data: pools };
  }

  // --- Seller & Admin Endpoints ---

  @Post('campaigns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller/Admin: Create a new community group buy campaign' })
  async createCampaign(@Req() req: any, @Body() dto: CreateGroupBuyCampaignDto) {
    const campaign = await this.groupBuyingService.createCampaign(req.user.id, dto);
    return { success: true, data: campaign };
  }

  @Patch('campaigns/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller/Admin: Update group buy campaign settings or status' })
  async updateCampaign(
    @Param('id') id: string,
    @Body() dto: UpdateGroupBuyCampaignDto,
  ) {
    const updated = await this.groupBuyingService.updateCampaign(id, dto);
    return { success: true, data: updated };
  }

  @Get('seller/my-campaigns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller: Get all campaigns created by authenticated seller' })
  async getSellerCampaigns(@Req() req: any) {
    const campaigns = await this.groupBuyingService.adminGetCampaigns(req.user.id);
    return { success: true, data: campaigns };
  }

  @Get('admin/campaigns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: List all nationwide group buy campaigns' })
  async getAdminCampaigns() {
    const campaigns = await this.groupBuyingService.adminGetCampaigns();
    return { success: true, data: campaigns };
  }

  @Get('admin/pools')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: List all nationwide buyer pooling instances' })
  @ApiQuery({ name: 'status', enum: GroupBuyPoolStatus, required: false })
  async getAdminPools(@Query('status') status?: GroupBuyPoolStatus) {
    const pools = await this.groupBuyingService.adminGetPools(status);
    return { success: true, data: pools };
  }
}
