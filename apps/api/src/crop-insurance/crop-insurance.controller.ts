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
import { CropInsuranceService } from './crop-insurance.service.js';
import {
  ApproveDisbursementDto,
  CreateCropInsurancePolicyDto,
  EnrollCropInsuranceDto,
  FileInsuranceClaimDto,
  QueryPolicyDto,
  SimulateTelemetryTriggerDto,
  UpdateCropInsurancePolicyDto,
} from './dto/insurance.dto.js';

@ApiTags('Parametric Weather Crop Insurance')
@Controller('crop-insurance')
export class CropInsuranceController {
  constructor(private readonly insuranceService: CropInsuranceService) {}

  // --- Public Endpoints ---

  @Get('policies')
  @ApiOperation({ summary: 'Public: Browse seasonal parametric crop insurance policies' })
  async getPolicies(@Query() query: QueryPolicyDto) {
    const result = await this.insuranceService.getPolicies(query);
    return { success: true, data: result };
  }

  @Get('policies/:id')
  @ApiOperation({ summary: 'Public: Get specific policy parameters and trigger thresholds' })
  async getPolicyById(@Param('id') id: string) {
    const policy = await this.insuranceService.getPolicyById(id);
    return { success: true, data: policy };
  }

  @Get('telemetry/recent')
  @ApiOperation({ summary: 'Public: View recent meteorological & river gauge telemetry readings' })
  async getRecentTelemetry() {
    const telemetry = await this.insuranceService.getRecentTelemetry(20);
    return { success: true, data: telemetry };
  }

  // --- Farmer Subscription & Claims ---

  @Post('enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Farmer: Enroll plot into parametric crop insurance with government subsidy' })
  async enrollFarmer(@Req() req: any, @Body() dto: EnrollCropInsuranceDto) {
    const enrollment = await this.insuranceService.enrollFarmer(req.user.id, dto);
    return { success: true, data: enrollment };
  }

  @Get('my-enrollments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Farmer: List all my active insurance policy certificates' })
  async getMyEnrollments(@Req() req: any) {
    const enrollments = await this.insuranceService.getMyEnrollments(req.user.id);
    return { success: true, data: enrollments };
  }

  @Get('enrollments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get insurance enrollment details by ID' })
  async getEnrollmentById(@Req() req: any, @Param('id') id: string) {
    const isAdmin = req.user.role === Role.ADMIN || req.user.role === Role.SUPER_ADMIN;
    const enrollment = await this.insuranceService.getEnrollmentById(id, req.user.id, isAdmin);
    return { success: true, data: enrollment };
  }

  @Post('enrollments/:id/claims')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Farmer: File disaster damage claim with GPS coordinates and field photos' })
  async fileManualClaim(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: FileInsuranceClaimDto,
  ) {
    const claim = await this.insuranceService.fileManualClaim(id, req.user.id, dto);
    return { success: true, data: claim };
  }

  // --- Admin & Underwriter Operations ---

  @Post('policies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Create new seasonal parametric crop insurance policy' })
  async createPolicy(@Body() dto: CreateCropInsurancePolicyDto) {
    const policy = await this.insuranceService.createPolicy(dto);
    return { success: true, data: policy };
  }

  @Patch('policies/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update policy parameters or status' })
  async updatePolicy(
    @Param('id') id: string,
    @Body() dto: UpdateCropInsurancePolicyDto,
  ) {
    const updated = await this.insuranceService.updatePolicy(id, dto);
    return { success: true, data: updated };
  }

  @Get('admin/enrollments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Supervise all nationwide farmer insurance subscriptions' })
  async getAllEnrollments(@Query('district') district?: string) {
    const enrollments = await this.insuranceService.getAllEnrollments({ district });
    return { success: true, data: enrollments };
  }

  @Get('admin/claims')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: View all parametric & manual disaster compensation claims' })
  async getAllClaims() {
    const claims = await this.insuranceService.getAllClaims();
    return { success: true, data: claims };
  }

  @Post('admin/claims/:id/disburse')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Approve and disburse disaster compensation via bKash/Nagad' })
  async approveDisbursement(
    @Param('id') id: string,
    @Body() dto: ApproveDisbursementDto,
  ) {
    const claim = await this.insuranceService.approveDisbursement(id, dto);
    return { success: true, data: claim };
  }

  @Post('admin/simulate-trigger')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Ingest/Simulate station weather breach & execute automated batch payouts' })
  async simulateWeatherTrigger(@Body() dto: SimulateTelemetryTriggerDto) {
    const result = await this.insuranceService.simulateWeatherTrigger(dto);
    return { success: true, data: result };
  }
}
