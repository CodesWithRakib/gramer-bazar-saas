import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

export enum NotificationType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  DELIVERY_ASSIGNED = 'DELIVERY_ASSIGNED',
  DELIVERY_STARTED = 'DELIVERY_STARTED',
  DELIVERY_COMPLETED = 'DELIVERY_COMPLETED',
  DELIVERY_FAILED = 'DELIVERY_FAILED',
  DELIVERY_REASSIGNED = 'DELIVERY_REASSIGNED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SELLER_APPLICATION_SUBMITTED = 'SELLER_APPLICATION_SUBMITTED',
  SELLER_APPLICATION_APPROVED = 'SELLER_APPLICATION_APPROVED',
  SELLER_APPLICATION_REJECTED = 'SELLER_APPLICATION_REJECTED',
  RIDER_APPLICATION_SUBMITTED = 'RIDER_APPLICATION_SUBMITTED',
  RIDER_APPLICATION_APPROVED = 'RIDER_APPLICATION_APPROVED',
  RIDER_APPLICATION_REJECTED = 'RIDER_APPLICATION_REJECTED',
  PAYOUT_REQUESTED = 'PAYOUT_REQUESTED',
  PAYOUT_PROCESSED = 'PAYOUT_PROCESSED',
  PAYOUT_REJECTED = 'PAYOUT_REJECTED',
  DISPUTE_OPENED = 'DISPUTE_OPENED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
  SYSTEM = 'SYSTEM',
  // Backward compatibility aliases
  ORDER_UPDATE = 'ORDER_UPDATE',
  PROMO = 'PROMO',
  REQUEST = 'REQUEST',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('notifications')
@Index(['userId', 'isRead', 'createdAt'])
@Index(['userId', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'title_key', type: 'varchar', length: 150, nullable: true })
  titleKey: string | null;

  @Column({ name: 'message_key', type: 'varchar', length: 150, nullable: true })
  messageKey: string | null;

  @Column({ type: 'varchar', length: 50, default: NotificationType.SYSTEM })
  type: NotificationType;

  @Column({
    type: 'varchar',
    length: 20,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
