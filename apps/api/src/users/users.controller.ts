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
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UpdateUserStatusDto, UpdateUserRolesDto } from './dto/update-user.dto.js';
import {
  ApiStandardResponse,
  ApiStandardPaginatedResponse,
  ApiCommonErrors,
} from '../common/decorators/api-standard-response.decorator.js';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List users with pagination, role filter, and keyword search',
    description: 'Requires ADMIN or SUPER_ADMIN role. Returns paginated user records without sensitive security hashes.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page (default 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'Rahim', description: 'Search term for name, phone, or email' })
  @ApiQuery({ name: 'role', required: false, enum: Role, description: 'Filter users by assigned role' })
  @ApiStandardPaginatedResponse(UserResponseDto, {
    description: 'Paginated user list retrieved successfully',
  })
  @ApiCommonErrors([401, 403, 500])
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('role') role?: Role,
  ) {
    return this.usersService.findAll(page, limit, search, role);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new staff or user account directly',
    description: 'Requires ADMIN or SUPER_ADMIN role. Dispatches administrative user onboarding with pre-assigned role.',
  })
  @ApiStandardResponse({
    type: UserResponseDto,
    status: HttpStatus.CREATED,
    description: 'User created successfully',
  })
  @ApiCommonErrors([400, 401, 403, 409, 500])
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
  @ApiOperation({
    summary: 'Update account lifecycle status',
    description: 'Requires ADMIN or SUPER_ADMIN role. Sets user status (e.g. ACTIVE, INACTIVE, BLOCKED, PENDING).',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'User UUID identifier' })
  @ApiStandardResponse({
    type: UserResponseDto,
    status: HttpStatus.OK,
    description: 'User status updated successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  async updateStatus(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    const updated = await this.usersService.update(id, { status: dto.status });
    await this.auditLogsService.record({
      actorId: req.user?.id,
      actorName: this.actorName(req.user),
      action: 'USER_STATUS_UPDATED',
      targetType: 'User',
      targetId: id,
      details: `Status set to ${dto.status}`,
    });
    return updated;
  }

  @Patch(':id/roles')
  @ApiOperation({
    summary: 'Update user assigned roles',
    description: 'Requires ADMIN or SUPER_ADMIN role. Replaces the set of roles assigned to the user.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'User UUID identifier' })
  @ApiStandardResponse({
    type: UserResponseDto,
    status: HttpStatus.OK,
    description: 'User roles updated successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  async updateRoles(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRolesDto,
  ) {
    const updated = await this.usersService.updateRoles(req.user, id, dto.roles);
    await this.auditLogsService.record({
      actorId: req.user?.id,
      actorName: this.actorName(req.user),
      action: 'USER_ROLES_UPDATED',
      targetType: 'User',
      targetId: id,
      details: `Roles set to ${dto.roles.join(', ')}`,
    });
    return updated;
  }

  private actorName(user?: { firstName?: string; lastName?: string }): string | null {
    if (!user) return null;
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return name || null;
  }
}
