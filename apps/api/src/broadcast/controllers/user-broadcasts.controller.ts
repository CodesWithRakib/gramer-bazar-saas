import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserBroadcastsService } from '../services/user-broadcasts.service.js';
import {
  QueryUserBroadcastsDto,
  UserBroadcastMessageDto,
  UserBroadcastUnreadCountDto,
} from '../dto/user-broadcast.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import {
  ApiCommonErrors,
  ApiStandardPaginatedResponse,
  ApiStandardResponse,
} from '../../common/decorators/api-standard-response.decorator.js';
import type { User } from '../../users/entities/user.entity.js';

@ApiTags('Broadcast — User Inbox')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('broadcasts/my-inbox')
export class UserBroadcastsController {
  constructor(private readonly userBroadcastsService: UserBroadcastsService) {}

  @Get()
  @ApiOperation({ summary: 'List broadcast announcements and messages received by the current user' })
  @ApiStandardPaginatedResponse(UserBroadcastMessageDto)
  @ApiCommonErrors([401])
  getMyInbox(@CurrentUser() user: User, @Query() query: QueryUserBroadcastsDto) {
    return this.userBroadcastsService.getMyInbox(user.id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get total unread broadcast count for current user badge indicators' })
  @ApiStandardResponse({ type: UserBroadcastUnreadCountDto })
  @ApiCommonErrors([401])
  getUnreadCount(@CurrentUser() user: User) {
    return this.userBroadcastsService.getUnreadCount(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific broadcast message' })
  @ApiStandardResponse({ type: UserBroadcastMessageDto })
  @ApiCommonErrors([401, 404])
  getMessage(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.userBroadcastsService.getMessage(user.id, id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a received broadcast message as read' })
  @ApiStandardResponse({ type: UserBroadcastMessageDto })
  @ApiCommonErrors([401, 404])
  markAsRead(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.userBroadcastsService.markAsRead(user.id, id);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all received broadcast messages as read' })
  @ApiStandardResponse({ status: HttpStatus.OK })
  @ApiCommonErrors([401])
  markAllAsRead(@CurrentUser() user: User) {
    return this.userBroadcastsService.markAllAsRead(user.id);
  }
}
