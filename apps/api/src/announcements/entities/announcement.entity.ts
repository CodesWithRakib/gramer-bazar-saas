import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Role } from '../../roles/enums/role.enum.js';

export enum AnnouncementPriority {
  NORMAL = 'NORMAL',
  IMPORTANT = 'IMPORTANT',
  URGENT = 'URGENT',
}

export enum AnnouncementStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  PARTIALLY_SENT = 'PARTIALLY_SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum AudienceType {
  EVERYONE = 'EVERYONE',
  ROLE = 'ROLE',
  MULTIPLE_ROLES = 'MULTIPLE_ROLES',
  SELECTED_USERS = 'SELECTED_USERS',
}

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'title_bn', type: 'varchar', length: 255, nullable: true })
  titleBn: string | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'message_bn', type: 'text', nullable: true })
  messageBn: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string | null;

  @Column({ name: 'cta_text', type: 'varchar', length: 100, nullable: true })
  ctaText: string | null;

  @Column({ name: 'cta_link', type: 'varchar', length: 255, nullable: true })
  ctaLink: string | null;

  @Column({ type: 'enum', enum: AnnouncementPriority, default: AnnouncementPriority.NORMAL })
  priority: AnnouncementPriority;

  @Column({ type: 'enum', enum: AnnouncementStatus, default: AnnouncementStatus.DRAFT })
  status: AnnouncementStatus;

  @Column({ name: 'audience_type', type: 'enum', enum: AudienceType })
  audienceType: AudienceType;

  @Column({ name: 'target_roles', type: 'jsonb', nullable: true })
  targetRoles: Role[] | null;

  @Column({ name: 'target_users', type: 'jsonb', nullable: true })
  targetUsers: string[] | null;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @Column({ name: 'total_recipients', type: 'int', default: 0 })
  totalRecipients: number;

  @Column({ name: 'total_delivered', type: 'int', default: 0 })
  totalDelivered: number;

  @Column({ name: 'total_read', type: 'int', default: 0 })
  totalRead: number;

  @Column({ name: 'total_failed', type: 'int', default: 0 })
  totalFailed: number;

  @Column({ name: 'created_by_user_id', type: 'uuid' })
  createdByUserId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser: Relation<User>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
