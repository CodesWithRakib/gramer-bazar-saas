import { Controller, Get, UseGuards, Post, Body, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { BulkCreateDemandEventDto } from './dto/create-demand-event.dto.js';
import {
  ApiStandardResponse,
  ApiStandardMessageResponse,
  ApiCommonErrors,
} from '../common/decorators/api-standard-response.decorator.js';
import {
  AdminDashboardResponseDto,
  DemandAnalyticsResponseDto,
} from './dto/analytics-response.dto.js';

@ApiTags('Analytics')
@Controller()
@ApiCommonErrors()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('admin/analytics/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Permissions('reports.read')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin: Get dashboard metrics',
    description:
      'Returns aggregate KPIs including orders, revenue, customer/seller/rider counts, recent orders, and 7-day revenue trend.',
  })
  @ApiStandardResponse({
    type: AdminDashboardResponseDto,
    description: 'Admin dashboard metrics retrieved successfully',
  })
  getDashboardMetrics() {
    return this.analyticsService.getDashboardMetrics();
  }

  @Post('analytics/events/bulk')
  @ApiOperation({
    summary: 'Track bulk demand events',
    description: 'Records telemetry and search/cart/view demand events from clients in batch.',
  })
  @ApiStandardMessageResponse({ status: 201, description: 'Demand events recorded successfully' })
  recordBulkEvents(@Request() req: any, @Body() dto: BulkCreateDemandEventDto) {
    const userId = req.user?.id;
    return this.analyticsService.recordBulkEvents(dto.events, userId);
  }

  @Get('admin/analytics/demand')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Permissions('reports.read')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin: Get demand analytics reports',
    description:
      'Returns popular products, high-frequency searches, category demands, and out-of-stock product views.',
  })
  @ApiStandardResponse({
    type: DemandAnalyticsResponseDto,
    description: 'Demand analytics reports retrieved successfully',
  })
  getDemandAnalytics(@Query('from') from?: string, @Query('to') to?: string) {
    return this.analyticsService.getDemandAnalytics(from, to);
  }

  @Get('admin/analytics/sales')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Permissions('reports.read')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin: Get sales analytics',
  })
  getSalesAnalytics(@Query('from') from?: string, @Query('to') to?: string) {
    return this.analyticsService.getSalesAnalytics(from, to);
  }

  @Get('admin/analytics/products')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Permissions('reports.read')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin: Get products analytics',
  })
  getProductsAnalytics(@Query('from') from?: string, @Query('to') to?: string) {
    return this.analyticsService.getProductsAnalytics(from, to);
  }

  @Get('admin/analytics/customers')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Permissions('reports.read')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin: Get customers analytics',
  })
  getCustomersAnalytics(@Query('from') from?: string, @Query('to') to?: string) {
    return this.analyticsService.getCustomersAnalytics(from, to);
  }
}
