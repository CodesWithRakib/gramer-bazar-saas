import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { BroadcastCampaignsService } from '../services/broadcast-campaigns.service.js';
import {
  BroadcastRecipientResponseDto,
  BroadcastResponseDto,
  BroadcastStatsDto,
  CreateBroadcastCampaignDto,
  QueryBroadcastRecipientsDto,
  QueryBroadcastsDto,
  TestBroadcastSendDto,
  UpdateBroadcastCampaignDto,
} from '../dto/campaign.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';
import {
  ApiCommonErrors,
  ApiStandardPaginatedResponse,
  ApiStandardResponse,
} from '../../common/decorators/api-standard-response.decorator.js';
import { toBroadcastActor } from '../utils/actor.js';
import type { User } from '../../users/entities/user.entity.js';

@ApiTags('Broadcast — Campaigns (Super Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('super-admin/broadcast/campaigns')
export class BroadcastCampaignsController {
  constructor(private readonly campaignsService: BroadcastCampaignsService) {}

  @Get()
  @ApiOperation({ summary: 'List broadcast campaigns (history, filterable)' })
  @ApiStandardPaginatedResponse(BroadcastResponseDto)
  @ApiCommonErrors([401, 403])
  findAll(@Query() query: QueryBroadcastsDto) {
    return this.campaignsService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a broadcast campaign (draft or scheduled)' })
  @ApiStandardResponse({ type: BroadcastResponseDto, status: HttpStatus.CREATED })
  @ApiCommonErrors([400, 401, 403])
  create(@Body() dto: CreateBroadcastCampaignDto, @CurrentUser() user: User) {
    return this.campaignsService.create(dto, toBroadcastActor(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a broadcast campaign by id' })
  @ApiStandardResponse({ type: BroadcastResponseDto })
  @ApiCommonErrors([401, 403, 404])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a draft or scheduled campaign' })
  @ApiStandardResponse({ type: BroadcastResponseDto })
  @ApiCommonErrors([400, 401, 403, 404])
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBroadcastCampaignDto,
    @CurrentUser() user: User,
  ) {
    return this.campaignsService.update(id, dto, toBroadcastActor(user));
  }

  @Post(':id/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test message through the active provider' })
  @ApiCommonErrors([400, 401, 403, 404])
  test(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TestBroadcastSendDto,
    @CurrentUser() user: User,
  ) {
    return this.campaignsService.testSend(id, dto, toBroadcastActor(user));
  }

  @Post(':id/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a campaign now (resolves audience and queues recipients)' })
  @ApiStandardResponse({ type: BroadcastResponseDto })
  @ApiCommonErrors([400, 401, 403, 404])
  send(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.campaignsService.sendNow(id, toBroadcastActor(user));
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a draft or scheduled campaign' })
  @ApiStandardResponse({ type: BroadcastResponseDto })
  @ApiCommonErrors([400, 401, 403, 404])
  cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.campaignsService.cancel(id, toBroadcastActor(user));
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Campaign delivery statistics (mock stats are simulated)' })
  @ApiStandardResponse({ type: BroadcastStatsDto })
  @ApiCommonErrors([401, 403, 404])
  stats(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignsService.getStats(id);
  }

  @Get(':id/recipients')
  @ApiOperation({ summary: 'Paginated campaign recipient delivery list' })
  @ApiStandardPaginatedResponse(BroadcastRecipientResponseDto)
  @ApiCommonErrors([401, 403, 404])
  recipients(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: QueryBroadcastRecipientsDto,
  ) {
    return this.campaignsService.getRecipients(id, query);
  }
}
