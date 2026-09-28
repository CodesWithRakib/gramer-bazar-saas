import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  ManyToOne,
  JoinTable,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import type { Message } from './message.entity.js';
import { ConversationType, ConversationStatus, SupportPriority } from '../enums/chat.enum.js';

@Entity('conversations')
@Index('idx_conversations_canonical_key', ['canonicalKey'], {
  unique: true,
  where: '"canonical_key" IS NOT NULL',
})
@Index('idx_conversations_updated_at', ['updatedAt'])
@Index('idx_conversations_type_status', ['type', 'status'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 32,
    default: ConversationType.DIRECT,
  })
  type: ConversationType;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'canonical_key',
    nullable: true,
  })
  canonicalKey: string | null;

  @Column({
    type: 'varchar',
    length: 32,
    default: ConversationStatus.ACTIVE,
  })
  status: ConversationStatus;

  @Column({
    type: 'varchar',
    length: 32,
    default: SupportPriority.MEDIUM,
  })
  priority: SupportPriority;

  @Column({
    type: 'varchar',
    length: 64,
    name: 'support_case_number',
    nullable: true,
  })
  supportCaseNumber: string | null;

  @Column({
    type: 'uuid',
    name: 'assigned_admin_id',
    nullable: true,
  })
  assignedAdminId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_admin_id' })
  assignedAdmin: User | null;

  @Column({ type: 'varchar', nullable: true })
  referenceId: string | null;

  @Column({ type: 'varchar', nullable: true })
  referenceType: string | null;

  @Column({ type: 'uuid', name: 'last_message_id', nullable: true })
  lastMessageId: string | null;

  @Column({ type: 'timestamp', name: 'last_message_at', nullable: true })
  lastMessageAt: Date | null;

  @Column({ type: 'text', name: 'last_message_preview', nullable: true })
  lastMessagePreview: string | null;

  @Column({ type: 'timestamp', name: 'closed_at', nullable: true })
  closedAt: Date | null;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'conversation_participants',
    joinColumn: { name: 'conversation_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  participants: User[];

  @OneToMany('Message', (message: Message) => message.conversation)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  lastMessage?: Message | null;

  unreadCount?: number;
}
