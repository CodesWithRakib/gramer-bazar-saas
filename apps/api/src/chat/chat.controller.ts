import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@Request() req: any) {
    return this.chatService.getUserConversations(req.user.id);
  }

  @Post('conversations')
  async createConversation(@Request() req: any, @Body('participantId') participantId: string) {
    return this.chatService.getOrCreateConversation([req.user.id, participantId]);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Param('id') id: string) {
    return this.chatService.getConversationMessages(id);
  }

  @Patch('conversations/:id/read')
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    await this.chatService.markAsRead(id, req.user.id);
    return { success: true };
  }
}
