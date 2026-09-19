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
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard.js';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    const room = `conversation_${data.conversationId}`;
    client.join(room);
    return { event: 'joined', room };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    const room = `conversation_${data.conversationId}`;
    client.leave(room);
    return { event: 'left', room };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket & { user: any },
    @MessageBody() data: { conversationId: string; content: string }
  ) {
    const senderId = client.user.userId || client.user.sub;
    
    // Save to DB
    const message = await this.chatService.sendMessage(
      senderId,
      data.conversationId,
      data.content,
    );

    const room = `conversation_${data.conversationId}`;
    
    // Broadcast to the room
    this.server.to(room).emit('new_message', message);
    
    // Return for ack
    return message;
  }
}
