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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service.js';
import { CreateSellerApplicationDto } from './dto/create-seller-application.dto.js';
import { CreateRiderApplicationDto } from './dto/create-rider-application.dto.js';
import { ReviewApplicationDto } from './dto/review-application.dto.js';
import { ApplicationStatus } from './enums/application-status.enum.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { ApiStandardResponse, ApiStandardPaginatedResponse, ApiCommonErrors } from '../common/decorators/api-standard-response.decorator.js';
import { SellerApplicationResponseDto, RiderApplicationResponseDto } from './dto/application-response.dto.js';

@ApiTags('Applications')
@Controller('applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiCommonErrors()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // ==================== USER: SELLER ====================

  @Post('seller')
  @ApiOperation({ summary: 'Submit a new seller application', description: 'User submits shop application to become an onboarded vendor on Gramer Bazar.' })
  @ApiStandardResponse({ type: SellerApplicationResponseDto, status: 201, description: 'Seller application submitted successfully' })
  submitSellerApplication(@Request() req: any, @Body() dto: CreateSellerApplicationDto) {
    return this.applicationsService.submitSellerApplication(req.user.id, dto);
  }

  @Get('seller/me')
  @ApiOperation({ summary: 'Get current user seller application status', description: 'Returns the logged-in user latest seller onboarding application.' })
  @ApiStandardResponse({ type: SellerApplicationResponseDto, description: 'Latest seller application status' })
  getSellerApplicationStatus(@Request() req: any) {
    return this.applicationsService.getSellerApplicationStatus(req.user.id);
  }

  // ==================== USER: RIDER ====================

  @Post('rider')
  @ApiOperation({ summary: 'Submit a new rider application', description: 'User submits rider onboarding application to provide local courier services.' })
  @ApiStandardResponse({ type: RiderApplicationResponseDto, status: 201, description: 'Rider application submitted successfully' })
  submitRiderApplication(@Request() req: any, @Body() dto: CreateRiderApplicationDto) {
    return this.applicationsService.submitRiderApplication(req.user.id, dto);
  }

  @Get('rider/me')
  @ApiOperation({ summary: 'Get current user rider application status', description: 'Returns the logged-in user latest rider onboarding application.' })
  @ApiStandardResponse({ type: RiderApplicationResponseDto, description: 'Latest rider application status' })
  getRiderApplicationStatus(@Request() req: any) {
    return this.applicationsService.getRiderApplicationStatus(req.user.id);
  }

  // ==================== ADMIN: SELLER APPLICATIONS ====================

  @Get('admin/sellers')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Get all seller applications', description: 'Returns paginated seller applications with status filtering.' })
  @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiStandardPaginatedResponse(SellerApplicationResponseDto, { description: 'Paginated seller applications' })
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
  @ApiOperation({ summary: 'Admin: Get seller application by ID', description: 'Returns complete seller application info for review.' })
  @ApiParam({ name: 'id', description: 'Seller application UUID' })
  @ApiStandardResponse({ type: SellerApplicationResponseDto, description: 'Seller application details' })
  getSellerApplicationById(@Param('id') id: string) {
    return this.applicationsService.getSellerApplicationById(id);
  }

  @Patch('admin/sellers/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Approve a seller application and activate role + shop', description: 'Grants SELLER role, provisions a new Shop entity, and marks application APPROVED.' })
  @ApiParam({ name: 'id', description: 'Seller application UUID' })
  @ApiStandardResponse({ type: SellerApplicationResponseDto, description: 'Seller application approved' })
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
  @ApiOperation({ summary: 'Admin: Reject a seller application with reason', description: 'Marks seller application REJECTED with rejection feedback notes.' })
  @ApiParam({ name: 'id', description: 'Seller application UUID' })
  @ApiStandardResponse({ type: SellerApplicationResponseDto, description: 'Seller application rejected' })
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
  @ApiOperation({ summary: 'Admin: Get all rider applications', description: 'Returns paginated rider applications with status filtering.' })
  @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiStandardPaginatedResponse(RiderApplicationResponseDto, { description: 'Paginated rider applications' })
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
  @ApiOperation({ summary: 'Admin: Get rider application by ID', description: 'Returns full rider application dossier.' })
  @ApiParam({ name: 'id', description: 'Rider application UUID' })
  @ApiStandardResponse({ type: RiderApplicationResponseDto, description: 'Rider application details' })
  getRiderApplicationById(@Param('id') id: string) {
    return this.applicationsService.getRiderApplicationById(id);
  }

  @Patch('admin/riders/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Approve a rider application and activate role', description: 'Grants RIDER role and marks application APPROVED.' })
  @ApiParam({ name: 'id', description: 'Rider application UUID' })
  @ApiStandardResponse({ type: RiderApplicationResponseDto, description: 'Rider application approved' })
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
  @ApiOperation({ summary: 'Admin: Reject a rider application with reason', description: 'Marks rider application REJECTED with rejection feedback notes.' })
  @ApiParam({ name: 'id', description: 'Rider application UUID' })
  @ApiStandardResponse({ type: RiderApplicationResponseDto, description: 'Rider application rejected' })
  rejectRiderApplication(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewApplicationDto,
  ) {
    return this.applicationsService.rejectRiderApplication(id, req.user.id, dto.adminNotes);
  }
}
