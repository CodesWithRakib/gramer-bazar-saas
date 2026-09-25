import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service.js';
import { CreateSellerApplicationDto } from './dto/create-seller-application.dto.js';
import { CreateRiderApplicationDto } from './dto/create-rider-application.dto.js';
import { ReviewApplicationDto } from './dto/review-application.dto.js';
import { ApplicationStatus } from './enums/application-status.enum.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';

@ApiTags('Applications')
@Controller('applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // ==================== USER: SELLER ====================

  @Post('seller')
  @ApiOperation({ summary: 'Submit a new seller application' })
  submitSellerApplication(@Request() req: any, @Body() dto: CreateSellerApplicationDto) {
    return this.applicationsService.submitSellerApplication(req.user.id, dto);
  }

  @Get('seller/me')
  @ApiOperation({ summary: 'Get current user seller application status' })
  getSellerApplicationStatus(@Request() req: any) {
    return this.applicationsService.getSellerApplicationStatus(req.user.id);
  }

  // ==================== USER: RIDER ====================

  @Post('rider')
  @ApiOperation({ summary: 'Submit a new rider application' })
  submitRiderApplication(@Request() req: any, @Body() dto: CreateRiderApplicationDto) {
    return this.applicationsService.submitRiderApplication(req.user.id, dto);
  }

  @Get('rider/me')
  @ApiOperation({ summary: 'Get current user rider application status' })
  getRiderApplicationStatus(@Request() req: any) {
    return this.applicationsService.getRiderApplicationStatus(req.user.id);
  }

  // ==================== ADMIN: SELLER APPLICATIONS ====================

  @Get('admin/sellers')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Get all seller applications' })
  @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getAllSellerApplications(
    @Query('status') status?: ApplicationStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.applicationsService.getAllSellerApplications(status, page, limit);
  }

  @Get('admin/sellers/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Get seller application by ID' })
  getSellerApplicationById(@Param('id') id: string) {
    return this.applicationsService.getSellerApplicationById(id);
  }

  @Patch('admin/sellers/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Approve a seller application and activate role + shop' })
  approveSellerApplication(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewApplicationDto,
  ) {
    return this.applicationsService.approveSellerApplication(id, req.user.id, dto.adminNotes);
  }

  @Patch('admin/sellers/:id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Reject a seller application with reason' })
  rejectSellerApplication(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewApplicationDto,
  ) {
    return this.applicationsService.rejectSellerApplication(id, req.user.id, dto.adminNotes);
  }

  // ==================== ADMIN: RIDER APPLICATIONS ====================

  @Get('admin/riders')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Get all rider applications' })
  @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getAllRiderApplications(
    @Query('status') status?: ApplicationStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.applicationsService.getAllRiderApplications(status, page, limit);
  }

  @Get('admin/riders/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Get rider application by ID' })
  getRiderApplicationById(@Param('id') id: string) {
    return this.applicationsService.getRiderApplicationById(id);
  }

  @Patch('admin/riders/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Approve a rider application and activate role' })
  approveRiderApplication(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewApplicationDto,
  ) {
    return this.applicationsService.approveRiderApplication(id, req.user.id, dto.adminNotes);
  }

  @Patch('admin/riders/:id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Reject a rider application with reason' })
  rejectRiderApplication(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewApplicationDto,
  ) {
    return this.applicationsService.rejectRiderApplication(id, req.user.id, dto.adminNotes);
  }
}
