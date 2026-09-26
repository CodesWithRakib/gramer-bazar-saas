import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { ApiStandardResponse, ApiStandardMessageResponse, ApiCommonErrors } from '../common/decorators/api-standard-response.decorator.js';
import { NotificationResponseDto, UnreadCountResponseDto } from './dto/notification-response.dto.js';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiCommonErrors()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications', description: 'Returns all notifications received by the authenticated user in reverse chronological order.' })
  @ApiStandardResponse({ type: NotificationResponseDto, isArray: true, description: 'List of user notifications' })
  getUserNotifications(@Request() req: any) {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count', description: 'Returns the count of unread notifications for badge counters.' })
  @ApiStandardResponse({ type: UnreadCountResponseDto, description: 'Count of unread notifications' })
  getUnreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read', description: 'Marks a single notification as read by its unique identifier.' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiStandardResponse({ type: NotificationResponseDto, description: 'Updated notification' })
  markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read', description: 'Marks all unread notifications of the current user as read in bulk.' })
  @ApiStandardMessageResponse({ description: 'All notifications marked as read' })
  markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}
