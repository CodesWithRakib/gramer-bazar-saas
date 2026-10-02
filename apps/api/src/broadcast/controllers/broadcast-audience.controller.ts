import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { BroadcastAudienceService } from '../services/broadcast-audience.service.js';
import { PreviewAudienceDto, SearchCustomersDto } from '../dto/audience.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';
import {
  ApiCommonErrors,
  ApiStandardResponse,
} from '../../common/decorators/api-standard-response.decorator.js';
import type { BroadcastAudienceConfigDto } from '../dto/campaign.dto.js';

@ApiTags('Broadcast — Audience (Super Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('super-admin/broadcast/audience')
export class BroadcastAudienceController {
  constructor(private readonly audienceService: BroadcastAudienceService) {}

  @Get('segments')
  @ApiOperation({ summary: 'Audience segment counts and marketing consent overview' })
  @ApiCommonErrors([401, 403])
  segments() {
    return this.audienceService.getSegmentCounts();
  }

  @Get('customers')
  @ApiOperation({ summary: 'Search customers for a SELECTED_CUSTOMERS audience' })
  @ApiCommonErrors([401, 403])
  customers(@Query() query: SearchCustomersDto) {
    return this.audienceService.searchCustomers(query.search, query.limit);
  }

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Preview the resolved audience and recipient count' })
  @ApiStandardResponse({ description: 'Audience preview' })
  @ApiCommonErrors([400, 401, 403])
  preview(@Body() dto: PreviewAudienceDto) {
    return this.audienceService.preview(
      dto.audienceType,
      (dto.audienceConfig ?? {}) as BroadcastAudienceConfigDto,
    );
  }
}
