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
import { HerbalSupplyService } from './herbal-supply.service.js';
import {
  CreateHerbalBatchDto,
  UpdateHerbalBatchDto,
  CreatePharmaContractDto,
  RecordMoistureAuditDto,
  FreshToDryCalculatorDto,
  QueryHerbalBatchesDto,
} from './dto/herbal-supply.dto.js';
import { SourcingContractStatus } from './enums/herbal-supply.enum.js';

@ApiTags('Organic Herbal & Ayurvedic Pharmacopoeia Supply Chain')
@Controller('herbal-supply')
export class HerbalSupplyController {
  constructor(private readonly herbalService: HerbalSupplyService) {}

  // --- Public Discovery & Calculations ---

  @Get('stats/overview')
  @ApiOperation({ summary: 'Public: Herbal stocks, moisture analytics and trade volume metrics' })
  async getOverviewStats() {
    const stats = await this.herbalService.getOverviewStats();
    return { success: true, data: stats };
  }

  @Get('batches')
  @ApiOperation({ summary: 'Public: Query certified herbal batches and medicinal flora' })
  async getBatches(@Query() query: QueryHerbalBatchesDto) {
    const batches = await this.herbalService.getBatches(query);
    return { success: true, data: batches };
  }

  @Get('batches/:id')
  @ApiOperation({ summary: 'Public: Get specific herbal batch details and laboratory audits' })
  async getBatchById(@Param('id') id: string) {
    const batch = await this.herbalService.getBatchById(id);
    return { success: true, data: batch };
  }

  @Get('biomass-calc')
  @ApiOperation({ summary: 'Public: Fresh-to-dry biomass conversion and farmer net profit calculator' })
  async calculateBiomass(@Query() query: FreshToDryCalculatorDto) {
    const result = this.herbalService.calculateFreshToDryBiomass(query);
    return { success: true, data: result };
  }

  // --- Grower & Cooperative Operations ---

  @Post('batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Grower: Register harvested botanical batch with lab credentials' })
  async createBatch(@Req() req: any, @Body() dto: CreateHerbalBatchDto) {
    const growerId = req.user.id;
    const batch = await this.herbalService.createBatch(growerId, dto);
    return { success: true, data: batch };
  }

  @Get('grower/my-batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Grower: Get all herbal batches listed by current cooperative' })
  async getMyBatches(@Req() req: any) {
    const growerId = req.user.id;
    const batches = await this.herbalService.getGrowerBatches(growerId);
    return { success: true, data: batches };
  }

  @Patch('batches/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Grower/Admin: Update batch weight, price or availability' })
  async updateBatch(
    @Param('id') id: string,
    @Body() dto: UpdateHerbalBatchDto,
  ) {
    const updated = await this.herbalService.updateBatch(id, dto);
    return { success: true, data: updated };
  }

  // --- Quality & Moisture Laboratory Audits ---

  @Post('audits')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Quality Inspector: Record moisture, aflatoxin and heavy metal test' })
  async recordMoistureAudit(@Req() req: any, @Body() dto: RecordMoistureAuditDto) {
    const inspectorId = req.user.id;
    const audit = await this.herbalService.recordMoistureAudit(inspectorId, dto);
    return { success: true, data: audit };
  }

  // --- Institutional Pharma Contracts ---

  @Post('contracts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pharma Buyer: Create wholesale contract sourcing agreement' })
  async createContract(@Req() req: any, @Body() dto: CreatePharmaContractDto) {
    const pharmaCompanyId = req.user.id;
    const contract = await this.herbalService.createPharmaContract(pharmaCompanyId, dto);
    return { success: true, data: contract };
  }

  @Get('contracts/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER, Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pharma Buyer: View active contracts' })
  async getMyContracts(@Req() req: any) {
    const companyId = req.user.id;
    const contracts = await this.herbalService.getPharmaContracts(companyId);
    return { success: true, data: contracts };
  }

  @Get('admin/contracts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: View all nationwide pharma supply contracts' })
  async getAllAdminContracts() {
    const contracts = await this.herbalService.getPharmaContracts();
    return { success: true, data: contracts };
  }

  @Patch('admin/contracts/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update contract status (e.g. FULFILLED_ACCEPTED)' })
  async updateContractStatus(
    @Param('id') id: string,
    @Body('status') status: SourcingContractStatus,
  ) {
    const updated = await this.herbalService.updateContractStatus(id, status);
    return { success: true, data: updated };
  }
}
