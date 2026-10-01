import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

import { AdminsService } from './admins.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import type { PermissionBearingUser } from '../common/utils/permission.js';
import {
  ApiStandardResponse,
  ApiStandardPaginatedResponse,
  ApiStandardMessageResponse,
  ApiCommonErrors,
} from '../common/decorators/api-standard-response.decorator.js';
import {
  AssignAdminPermissionsDto,
  CreateAdminDto,
  ResetAdminPasswordDto,
  UpdateAdminDto,
  UpdateRolePermissionsDto,
} from './dto/admin.dto.js';
import { AdminAccountDto } from './dto/admin-response.dto.js';

interface AuthenticatedAdmin extends PermissionBearingUser {
  id: string;
  firstName?: string;
  lastName?: string;
}

@ApiTags('Admin Management (Super Admin)')
@Controller('admin/admins')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
@ApiCommonErrors()
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get the authenticated admin profile with effective permissions',
    description:
      'Returns the current admin account plus the effective permission set used by the frontend to gate navigation.',
  })
  @ApiStandardResponse({ type: AdminAccountDto, description: 'Current admin profile' })
  getMyProfile(@Request() req: { user: AuthenticatedAdmin }) {
    return this.adminsService.getMyProfile(req.user);
  }

  @Get('permissions')
  @Permissions('admins.read')
  @ApiOperation({
    summary: 'List all permissions grouped by module',
    description: 'Returns the canonical permission catalog for the permission-management UI.',
  })
  listPermissions() {
    return this.adminsService.listPermissions();
  }

  @Get('roles')
  @Permissions('roles.manage')
  @ApiOperation({
    summary: 'List roles and their permission sets',
    description: 'Returns every platform role with the permissions currently assigned to it.',
  })
  listRoles() {
    return this.adminsService.listRoles();
  }

  @Patch('roles/:role/permissions')
  @Permissions('roles.manage')
  @ApiOperation({
    summary: 'Replace the permission set of a role (Super Admin only)',
    description: 'Updates role permissions. Protected roles such as SUPER_ADMIN cannot be edited.',
  })
  @ApiParam({ name: 'role', enum: Role })
  async updateRolePermissions(
    @Request() req: { user: AuthenticatedAdmin },
    @Param('role', new ParseEnumPipe(Role)) role: Role,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    const result = await this.adminsService.updateRolePermissions(
      req.user,
      role,
      dto.permissions,
    );
    await this.audit(req, 'ROLE_PERMISSIONS_UPDATED', 'Role', role, `Permissions: ${result.permissions.join(', ')}`);
    return result;
  }

  @Get()
  @Permissions('admins.read')
  @ApiOperation({
    summary: 'List administrative accounts',
    description: 'Paginated list of Admin and Super Admin accounts with their direct grants.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiStandardPaginatedResponse(AdminAccountDto, { description: 'Paginated admin accounts' })
  listAdmins(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('role', new ParseEnumPipe(Role, { optional: true })) role?: Role,
  ) {
    return this.adminsService.listAdmins(Number(page), Number(limit), search, role);
  }

  @Get(':id')
  @Permissions('admins.read')
  @ApiOperation({ summary: 'Get an administrative account by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiStandardResponse({ type: AdminAccountDto, description: 'Administrative account details' })
  getAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminsService.getAdmin(id);
  }

  @Post()
  @Permissions('admins.create')
  @ApiOperation({
    summary: 'Create a new administrative account',
    description:
      'Creates an Admin (or Super Admin, Super Admin callers only) with optional explicit permission grants.',
  })
  @ApiStandardResponse({
    type: AdminAccountDto,
    status: 201,
    description: 'Administrative account created',
  })
  async createAdmin(
    @Request() req: { user: AuthenticatedAdmin },
    @Body() dto: CreateAdminDto,
  ) {
    const admin = await this.adminsService.createAdmin(req.user, dto);
    await this.audit(req, 'ADMIN_CREATED', 'User', admin.id, `Role ${dto.role}`);
    return admin;
  }

  @Patch(':id')
  @Permissions('admins.update')
  @ApiOperation({ summary: 'Update an administrative account' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiStandardResponse({ type: AdminAccountDto, description: 'Administrative account updated' })
  async updateAdmin(
    @Request() req: { user: AuthenticatedAdmin },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminDto,
  ) {
    const admin = await this.adminsService.updateAdmin(req.user, id, dto);
    await this.audit(req, 'ADMIN_UPDATED', 'User', id, JSON.stringify(dto));
    return admin;
  }

  @Patch(':id/permissions')
  @Permissions('admins.update')
  @ApiOperation({
    summary: 'Replace the explicit permission grants of an admin',
    description: 'Super Admin permissions are system-defined and cannot be edited.',
  })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiStandardResponse({ type: AdminAccountDto, description: 'Permissions updated' })
  async setPermissions(
    @Request() req: { user: AuthenticatedAdmin },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignAdminPermissionsDto,
  ) {
    const admin = await this.adminsService.setPermissions(req.user, id, dto);
    await this.audit(
      req,
      'ADMIN_PERMISSIONS_UPDATED',
      'User',
      id,
      `Permissions: ${dto.permissions.join(', ')}`,
    );
    return admin;
  }

  @Patch(':id/password')
  @Permissions('admins.update')
  @ApiOperation({ summary: 'Reset an administrative account password' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiStandardMessageResponse({ description: 'Password reset successfully' })
  async resetPassword(
    @Request() req: { user: AuthenticatedAdmin },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResetAdminPasswordDto,
  ) {
    const result = await this.adminsService.resetPassword(req.user, id, dto);
    await this.audit(req, 'ADMIN_PASSWORD_RESET', 'User', id, null);
    return result;
  }

  @Delete(':id')
  @Permissions('admins.delete')
  @ApiOperation({
    summary: 'Deactivate an administrative account',
    description: 'Soft-deactivates the account and revokes its refresh tokens.',
  })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiStandardMessageResponse({ description: 'Administrative account deactivated' })
  async deactivateAdmin(
    @Request() req: { user: AuthenticatedAdmin },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const result = await this.adminsService.deactivateAdmin(req.user, id);
    await this.audit(req, 'ADMIN_DEACTIVATED', 'User', id, null);
    return result;
  }


  private async audit(
    req: { user: AuthenticatedAdmin },
    action: string,
    targetType: string,
    targetId: string | null,
    details: string | null,
  ): Promise<void> {
    const name = `${req.user?.firstName ?? ''} ${req.user?.lastName ?? ''}`.trim();
    await this.auditLogsService.record({
      actorId: req.user?.id ?? null,
      actorName: name || null,
      action,
      targetType,
      targetId,
      details,
    });
  }
}
