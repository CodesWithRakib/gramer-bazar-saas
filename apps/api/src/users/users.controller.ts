import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Patch,
  Param,
  Body,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { UserStatus } from './enums/user-status.enum.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@ApiTags('Users (Admin)')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('role') role?: Role,
  ) {
    return this.usersService.findAll(page, limit, search, role);
  }

  @Post()
  @ApiOperation({ summary: 'Admin/Super Admin: Create a new user' })
  async create(
    @Request() req: any,
    @Body() createUserDto: CreateUserDto,
  ) {
    const user = await this.usersService.createByAdmin(req.user, createUserDto);
    await this.auditLogsService.record({
      actorId: req.user?.id,
      actorName: this.actorName(req.user),
      action: 'USER_CREATED',
      targetType: 'User',
      targetId: user.id,
      details: `User created with role ${createUserDto.role}`,
    });
    return user;
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update user status (e.g., ACTIVE, INACTIVE, SUSPENDED)' })
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ) {
    const updated = await this.usersService.update(id, { status });
    await this.auditLogsService.record({
      actorId: req.user?.id,
      actorName: this.actorName(req.user),
      action: 'USER_STATUS_UPDATED',
      targetType: 'User',
      targetId: id,
      details: `Status set to ${status}`,
    });
    return updated;
  }

  @Patch(':id/roles')
  @ApiOperation({ summary: 'Update user roles' })
  async updateRoles(
    @Request() req: any,
    @Param('id') id: string,
    @Body('roles') roles: string[],
  ) {
    const updated = await this.usersService.updateRoles(id, roles);
    await this.auditLogsService.record({
      actorId: req.user?.id,
      actorName: this.actorName(req.user),
      action: 'USER_ROLES_UPDATED',
      targetType: 'User',
      targetId: id,
      details: `Roles set to ${roles.join(', ')}`,
    });
    return updated;
  }

  private actorName(user?: { firstName?: string; lastName?: string }): string | null {
    if (!user) return null;
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return name || null;
  }
}
