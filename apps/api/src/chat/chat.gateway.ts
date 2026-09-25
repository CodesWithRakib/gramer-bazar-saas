import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket, 
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, UseFilters, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ChatService, canUserAccessConversation, isUserAdmin } from './chat.service.js';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard.js';
import { AllWsExceptionsFilter } from '../common/filters/ws-exception.filter.js';
import { JoinConversationDto, SendMessageDto } from './dto/chat-gateway.dto.js';
import { UsersService } from '../users/users.service.js';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseFilters(AllWsExceptionsFilter)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  handleConnection(_client: Socket) {
    // Connection is authenticated lazily per-message via WsJwtGuard.
  }

  handleDisconnect(_client: Socket) {
    // Rooms are automatically cleaned up when the socket disconnects.
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_user')
  async handleJoinUser(@ConnectedSocket() client: Socket & { user: any }) {
    const userId = client.user?.userId ?? client.user?.sub;
    if (!userId) return;

    void client.join(`user_${userId}`);

    const user = await this.usersService.findById(userId).catch(() => null);
    if (user && isUserAdmin(user)) {
      void client.join('admin_room');
    }

    return { event: 'joined_user', userId };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket & { user: any },
    @MessageBody() data: JoinConversationDto,
  ) {
    const userId = client.user?.userId ?? client.user?.sub;
    if (!userId) {
      throw new WsException('Unauthenticated');
    }

    // Verify access
    const user = await this.usersService.findById(userId).catch(() => null);
    if (!user) {
      throw new WsException('User not found');
    }

    const conversation = await this.chatService.getConversationById(data.conversationId, user).catch(() => null);
    if (!conversation) {
      throw new WsException('Conversation not found or access denied');
    }

    const room = `conversation_${data.conversationId}`;
    void client.join(room);
    return { event: 'joined', room };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinConversationDto,
  ) {
    const room = `conversation_${data.conversationId}`;
    void client.leave(room);
    return { event: 'left', room };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket & { user: any },
    @MessageBody() data: SendMessageDto,
  ) {
    try {
      const senderId = client.user?.userId ?? client.user?.sub;
      if (!senderId) {
        throw new WsException('Unauthenticated');
      }

      // Save to DB
      const message = await this.chatService.sendMessage(
        senderId,
        data.conversationId,
        data.content,
        data.messageType,
      );

      const room = `conversation_${data.conversationId}`;

      // Broadcast new message to active conversation room
      this.server.to(room).emit('new_message', message);

      // Notify individual participants so their conversation list and unread counts update
      const conversation = await this.chatService['conversationRepository'].findOne({
        where: { id: data.conversationId },
        relations: ['participants'],
      });

      if (conversation?.participants) {
        for (const p of conversation.participants) {
          this.server.to(`user_${p.id}`).emit('conversation_updated', {
            conversationId: data.conversationId,
            lastMessage: message,
          });
        }
      }

      // Also notify all admins in real time
      this.server.to('admin_room').emit('conversation_updated', {
        conversationId: data.conversationId,
        lastMessage: message,
      });

      return message;
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error('Error in handleMessage: ' + (error.message || String(err)));
      throw err;
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket & { user: any },
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.user?.userId ?? client.user?.sub;
    if (!userId || !data?.conversationId) return;

    const user = await this.usersService.findById(userId).catch(() => null);
    if (!user) return;

    await this.chatService.markAsRead(data.conversationId, user).catch(() => null);

    // Notify room that messages were read
    this.server.to(`conversation_${data.conversationId}`).emit('messages_read', {
      conversationId: data.conversationId,
      readBy: userId,
    });

    return { success: true };
  }

  @OnEvent('order.status.updated')
  handleOrderStatusUpdated(payload: {
    orderId: string;
    previousStatus: string;
    currentStatus: string;
    userId: string;
    sellerUserIds?: string[];
    riderUserId?: string | null;
    updatedAt: string;
  }) {
    if (!this.server) return;

    const eventPayload = {
      orderId: payload.orderId,
      previousStatus: payload.previousStatus,
      currentStatus: payload.currentStatus,
      updatedAt: payload.updatedAt,
    };

    // 1. Notify Customer
    if (payload.userId) {
      this.server.to(`user_${payload.userId}`).emit('order.status.updated', eventPayload);
    }

    // 2. Notify Admins and Super Admins
    this.server.to('admin_room').emit('order.status.updated', eventPayload);

    // 3. Notify Assigned Rider if any
    if (payload.riderUserId) {
      this.server.to(`user_${payload.riderUserId}`).emit('order.status.updated', eventPayload);
    }

    // 4. Notify Sellers associated with items in this order
    if (payload.sellerUserIds && payload.sellerUserIds.length > 0) {
      for (const sellerId of payload.sellerUserIds) {
        this.server.to(`user_${sellerId}`).emit('order.status.updated', eventPayload);
      }
    }
  }
}

