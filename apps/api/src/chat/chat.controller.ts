import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    return this.chatService.getUnreadCounts(req.user);
  }

  @Get('conversations')
  async getConversations(@Request() req: any) {
    return this.chatService.getUserConversations(req.user);
  }

  @Post('conversations')
  async createConversation(
    @Request() req: any,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.getOrCreateConversation(
      [req.user.id, dto.participantId],
      dto.referenceId,
      dto.referenceType,
      req.user,
    );
  }

  @Get('conversations/:id')
  async getConversation(@Request() req: any, @Param('id') id: string) {
    return this.chatService.getConversationById(id, req.user);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Request() req: any,
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.chatService.getConversationMessages(id, req.user, parsedLimit, before);
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Request() req: any,
    @Param('id') id: string,
    @Body('content') content: string,
    @Body('messageType') messageType?: string,
  ) {
    return this.chatService.sendMessage(req.user.id, id, content, messageType);
  }

  @Patch('conversations/:id/read')
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.chatService.markAsRead(id, req.user);
  }
}

