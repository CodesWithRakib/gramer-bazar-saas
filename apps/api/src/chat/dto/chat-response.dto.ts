import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConversationParticipantDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'Rahim' })
  firstName: string;

  @ApiPropertyOptional({ example: 'Mia', nullable: true })
  lastName?: string | null;

  @ApiProperty({ example: '01712345678' })
  phone: string;
}

export class ChatMessageResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  conversationId: string;

  @ApiProperty({ example: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f' })
  senderId: string;

  @ApiProperty({ example: 'Hello, is this product fresh today?' })
  content: string;

  @ApiProperty({ example: 'TEXT' })
  messageType: string;

  @ApiPropertyOptional({ example: 'CUSTOMER', nullable: true })
  senderRole?: string | null;

  @ApiProperty({ example: false })
  isRead: boolean;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;
}

export class ConversationResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiPropertyOptional({ example: 'order-uuid-12345', nullable: true })
  referenceId?: string | null;

  @ApiPropertyOptional({ example: 'ORDER', nullable: true })
  referenceType?: string | null;

  @ApiProperty({ type: [ConversationParticipantDto] })
  participants: ConversationParticipantDto[];

  @ApiPropertyOptional({ type: ChatMessageResponseDto, nullable: true })
  lastMessage?: ChatMessageResponseDto | null;

  @ApiPropertyOptional({ example: 2 })
  unreadCount?: number;

  @ApiProperty({ example: '2026-09-26T09:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  updatedAt: string;
}

export class ChatUnreadCountsResponseDto {
  @ApiProperty({ example: 5, description: 'Total unread messages across all conversations' })
  unreadCount: number;

  @ApiProperty({ example: 2, description: 'Total conversations with at least one unread message' })
  unreadConversationsCount: number;
}

export class SendChatMessageDto {
  @ApiProperty({ example: 'Hello, I have a question regarding my order.', description: 'Message body text' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'TEXT', default: 'TEXT', description: 'Message type (TEXT, IMAGE, SYSTEM)' })
  @IsString()
  @IsOptional()
  messageType?: string;
}
