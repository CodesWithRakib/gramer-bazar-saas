import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import type { Conversation } from './conversation.entity.js';
import { MessageStatus, MessageType } from '../enums/chat.enum.js';

@Entity('messages')
@Index('idx_messages_conversation_created', ['conversationId', 'createdAt'])
@Index('idx_messages_unread', ['conversationId', 'senderId', 'isRead'], { where: '"isRead" = false' })
@Index('idx_messages_client_id', ['conversationId', 'clientMessageId'], { unique: true, where: '"client_message_id" IS NOT NULL' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({ type: 'varchar', default: MessageType.TEXT })
  messageType: string;

  @Column({ type: 'varchar', nullable: true })
  senderRole: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'sender_id' })
  senderId: string;

  @ManyToOne('Conversation', (conversation: Conversation) => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ name: 'conversation_id' })
  conversationId: string;

  @Column({
    type: 'varchar',
    length: 32,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @Column({ default: false })
  isRead: boolean;

  @Column({ name: 'client_message_id', type: 'varchar', length: 128, nullable: true })
  clientMessageId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date | null;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
