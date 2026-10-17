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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { ContractFarmingService } from './contract-farming.service.js';
import {
  ApplyContractAgreementDto,
  CreateContractCampaignDto,
  QueryContractCampaignDto,
  RecordHarvestDeliveryDto,
  SettleAgreementFinalEscrowDto,
  SubmitMilestoneInspectionDto,
  UpdateAgreementStatusDto,
  UpdateContractCampaignDto,
} from './dto/contract-farming.dto.js';

@ApiTags('Agricultural Contract Farming & Forward Purchase')
@Controller('contract-farming')
export class ContractFarmingController {
  constructor(private readonly contractFarmingService: ContractFarmingService) {}

  // --- Public Endpoints ---

  @Get('campaigns')
  @ApiOperation({ summary: 'Public: Browse corporate contract farming & forward purchase campaigns' })
  async getCampaigns(@Query() query: QueryContractCampaignDto) {
    const result = await this.contractFarmingService.findAllCampaigns(query);
    return { success: true, data: result };
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Public: Get specific contract campaign terms and floor price' })
  async getCampaignById(@Param('id') id: string) {
    const campaign = await this.contractFarmingService.findCampaignById(id);
    return { success: true, data: campaign };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Public: Contract farming platform escrow and volume statistics' })
  async getPlatformStats() {
    const stats = await this.contractFarmingService.getPlatformStats();
    return { success: true, data: stats };
  }

  // --- Corporate Buyer Endpoints ---

  @Post('campaigns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer: Launch a new forward purchase contract campaign' })
  async createCampaign(@Req() req: any, @Body() dto: CreateContractCampaignDto) {
    const campaign = await this.contractFarmingService.createCampaign(req.user.id, dto);
    return { success: true, data: campaign };
  }

  @Patch('campaigns/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer/Admin: Update campaign details or enrollment status' })
  async updateCampaign(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateContractCampaignDto,
  ) {
    const isAdmin = req.user.role === Role.ADMIN || req.user.role === Role.SUPER_ADMIN;
    const campaign = await this.contractFarmingService.updateCampaign(req.user.id, id, dto, isAdmin);
    return { success: true, data: campaign };
  }

  // --- Farmer Agreement Applications ---

  @Post('agreements/apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Farmer: Apply land area for forward contract farming' })
  async applyAgreement(@Req() req: any, @Body() dto: ApplyContractAgreementDto) {
    const agreement = await this.contractFarmingService.applyForAgreement(req.user.id, dto);
    return { success: true, data: agreement };
  }

  @Get('agreements/farmer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Farmer: View all my active and historical contract farming agreements' })
  async getFarmerAgreements(@Req() req: any) {
    const agreements = await this.contractFarmingService.getFarmerAgreements(req.user.id);
    return { success: true, data: agreements };
  }

  @Get('agreements/buyer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer: View all enrolled farmer agreements under my campaigns' })
  async getBuyerAgreements(@Req() req: any) {
    const agreements = await this.contractFarmingService.getBuyerAgreements(req.user.id);
    return { success: true, data: agreements };
  }

  @Get('agreements/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Monitor all contract agreements across the country' })
  async getAllAgreements() {
    const agreements = await this.contractFarmingService.getAllAgreements();
    return { success: true, data: agreements };
  }

  @Get('agreements/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get specific contract agreement with inspections and deliveries' })
  async getAgreementById(@Param('id') id: string) {
    const agreement = await this.contractFarmingService.getAgreementById(id);
    return { success: true, data: agreement };
  }

  @Patch('agreements/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer/Admin: Update agreement status & release advance input cash' })
  async updateAgreementStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAgreementStatusDto,
  ) {
    const isAdmin = req.user.role === Role.ADMIN || req.user.role === Role.SUPER_ADMIN;
    const agreement = await this.contractFarmingService.updateAgreementStatus(
      id,
      dto,
      req.user.id,
      isAdmin,
    );
    return { success: true, data: agreement };
  }

  // --- Pre-Harvest Milestone Inspections ---

  @Post('agreements/:id/inspections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inspector/Buyer: Record crop growth milestone field audit' })
  async submitMilestoneInspection(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: SubmitMilestoneInspectionDto,
  ) {
    const inspection = await this.contractFarmingService.submitMilestoneInspection(
      id,
      req.user.id,
      dto,
    );
    return { success: true, data: inspection };
  }

  // --- Weighbridge Harvest Deliveries ---

  @Post('agreements/:id/deliveries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Weighbridge: Record gross/tare net weight and generate intake voucher' })
  async recordHarvestDelivery(
    @Param('id') id: string,
    @Body() dto: RecordHarvestDeliveryDto,
  ) {
    const delivery = await this.contractFarmingService.recordHarvestDelivery(id, dto);
    return { success: true, data: delivery };
  }

  // --- Final Escrow Settlement ---

  @Post('agreements/:id/settle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer/Admin: Settle final escrow balance to farmer payout account' })
  async settleAgreement(
    @Param('id') id: string,
    @Body() dto: SettleAgreementFinalEscrowDto,
  ) {
    const settled = await this.contractFarmingService.settleAgreementFinalEscrow(id, dto);
    return { success: true, data: settled };
  }
}
