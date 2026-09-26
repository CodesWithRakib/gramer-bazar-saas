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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { ApiStandardResponse, ApiStandardMessageResponse, ApiCommonErrors } from '../common/decorators/api-standard-response.decorator.js';
import {
  ConversationResponseDto,
  ChatMessageResponseDto,
  ChatUnreadCountsResponseDto,
  SendChatMessageDto,
} from './dto/chat-response.dto.js';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiCommonErrors()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message and conversation counts', description: 'Returns aggregate counts of unread messages and conversations for badges.' })
  @ApiStandardResponse({ type: ChatUnreadCountsResponseDto, description: 'Unread counts retrieved successfully' })
  async getUnreadCount(@Request() req: any) {
    return this.chatService.getUnreadCounts(req.user);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations', description: 'Lists all active chat threads for the authenticated user, ordered by latest activity.' })
  @ApiStandardResponse({ type: ConversationResponseDto, isArray: true, description: 'List of conversations' })
  async getConversations(@Request() req: any) {
    return this.chatService.getUserConversations(req.user);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create or retrieve existing conversation', description: 'Finds or creates a chat conversation between user and participant (optionally linked to order/product).' })
  @ApiStandardResponse({ type: ConversationResponseDto, status: 201, description: 'Conversation retrieved or created' })
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
  @ApiOperation({ summary: 'Get single conversation details', description: 'Returns conversation metadata and participant profiles.' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiStandardResponse({ type: ConversationResponseDto, description: 'Conversation details' })
  async getConversation(@Request() req: any, @Param('id') id: string) {
    return this.chatService.getConversationById(id, req.user);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get conversation message history', description: 'Paginated historical chat messages with cursor pagination.' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'before', required: false, type: String, description: 'Message ID cursor for backward pagination' })
  @ApiStandardResponse({ type: ChatMessageResponseDto, isArray: true, description: 'Historical messages' })
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
  @ApiOperation({ summary: 'Send message in conversation', description: 'Dispatches a new text or media message to a conversation thread.' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiStandardResponse({ type: ChatMessageResponseDto, status: 201, description: 'Message sent successfully' })
  async sendMessage(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: SendChatMessageDto,
  ) {
    return this.chatService.sendMessage(req.user.id, id, dto.content, dto.messageType);
  }

  @Patch('conversations/:id/read')
  @ApiOperation({ summary: 'Mark conversation messages as read', description: 'Marks all incoming unread messages in the thread as read.' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @ApiStandardMessageResponse({ description: 'Conversation messages marked as read' })
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.chatService.markAsRead(id, req.user);
  }
}
