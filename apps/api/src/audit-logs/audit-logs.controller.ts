import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { ApiStandardPaginatedResponse, ApiCommonErrors } from '../common/decorators/api-standard-response.decorator.js';
import { AuditLogResponseDto } from './dto/audit-log-response.dto.js';

@ApiTags('Audit Logs (Admin)')
@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth()
@ApiCommonErrors()
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs (Admin)', description: 'Returns paginated administrative audit logs tracking mutations, actor identity, and payload changes.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search logs by action, actor name, or details' })
  @ApiStandardPaginatedResponse(AuditLogResponseDto, { description: 'Paginated audit logs' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.auditLogsService.findAll(Number(page), Number(limit), search);
  }
}
