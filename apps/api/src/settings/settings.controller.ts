import { Body, Controller, Get, Patch, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { ApiStandardResponse, ApiCommonErrors } from '../common/decorators/api-standard-response.decorator.js';
import { PlatformSettingsResponseDto } from './dto/settings-response.dto.js';

@ApiTags('Settings (Admin)')
@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth()
@ApiCommonErrors()
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get marketplace settings (Admin)', description: 'Returns system-wide operational configurations and payment gateway credentials.' })
  @ApiStandardResponse({ type: PlatformSettingsResponseDto, description: 'Marketplace platform settings' })
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  @ApiOperation({ summary: 'Update marketplace settings (Admin)', description: 'Persists marketplace settings updates and logs an administrative audit entry.' })
  @ApiStandardResponse({ type: PlatformSettingsResponseDto, description: 'Updated marketplace settings' })
  async updateSettings(
    @Request() req: { user: { id: string; firstName?: string; lastName?: string } },
    @Body() dto: UpdateSettingsDto,
  ) {
    const settings = await this.settingsService.updateSettings(dto);

    await this.auditLogsService.record({
      actorId: req.user?.id ?? null,
      actorName: `${req.user?.firstName ?? ''} ${req.user?.lastName ?? ''}`.trim() || null,
      action: 'SETTINGS_UPDATED',
      targetType: 'PlatformSetting',
      targetId: Object.keys(dto).join(','),
      details: JSON.stringify(dto),
    });

    return settings;
  }
}
