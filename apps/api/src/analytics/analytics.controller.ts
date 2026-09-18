import { Controller, Get, UseGuards, Post, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { BulkCreateDemandEventDto } from './dto/create-demand-event.dto.js';

@ApiTags('Analytics')
@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('admin/analytics/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard metrics for admin' })
  getDashboardMetrics() {
    return this.analyticsService.getDashboardMetrics();
  }

  @Post('analytics/events/bulk')
  @ApiOperation({ summary: 'Track bulk demand events' })
  recordBulkEvents(
    @Request() req: any,
    @Body() dto: BulkCreateDemandEventDto,
  ) {
    const userId = req.user?.id;
    return this.analyticsService.recordBulkEvents(dto.events, userId);
  }

  @Get('admin/analytics/demand')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get demand analytics reports' })
  getDemandAnalytics() {
    return this.analyticsService.getDemandAnalytics();
  }
}
