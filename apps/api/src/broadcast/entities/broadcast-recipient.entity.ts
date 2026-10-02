import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
  type Relation,
} from 'typeorm';
import { Broadcast } from './broadcast.entity.js';
import { BroadcastRecipientStatus } from '../enums/broadcast.enums.js';

/**
 * A single resolved recipient of a campaign.
 *
 * The customer name/phone are intentionally snapshotted (denormalized) so the
 * campaign history remains an accurate record even if the customer later
 * changes their phone or is deleted. The unique constraint on
 * (broadcast_id, customer_id) is the idempotency guard that prevents a
 * recipient from being enqueued twice for the same campaign.
 */
@Entity('broadcast_recipients')
@Index('idx_broadcast_recipients_broadcast_status', ['broadcastId', 'status'])
@Index('idx_broadcast_recipients_customer', ['customerId'])
@Index('idx_broadcast_recipients_next_retry', ['nextRetryAt'])
@Unique('uq_broadcast_recipients_broadcast_customer', ['broadcastId', 'customerId'])
export class BroadcastRecipient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'broadcast_id', type: 'uuid' })
  broadcastId: string;

  @ManyToOne(() => Broadcast, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'broadcast_id' })
  broadcast: Relation<Broadcast>;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string | null;

  /** Snapshot of the recipient display name at send time. */
  @Column({ name: 'customer_name', type: 'varchar', length: 200, nullable: true })
  customerName: string | null;

  /** Snapshot of the recipient phone number at send time. */
  @Column({ type: 'varchar', length: 20 })
  phone: string;

  /** Fully rendered, personalized message for this recipient. */
  @Column({ name: 'personalized_message', type: 'text', nullable: true })
  personalizedMessage: string | null;

  @Column({
    type: 'enum',
    enum: BroadcastRecipientStatus,
    default: BroadcastRecipientStatus.PENDING,
  })
  status: BroadcastRecipientStatus;

  @Column({ name: 'provider_message_id', type: 'varchar', length: 200, nullable: true })
  providerMessageId: string | null;

  @Column({ name: 'attempt_count', type: 'int', default: 0 })
  attemptCount: number;

  @Column({ name: 'next_retry_at', type: 'timestamp', nullable: true })
  nextRetryAt: Date | null;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date | null;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date | null;

  @Column({ name: 'failed_at', type: 'timestamp', nullable: true })
  failedAt: Date | null;

  @Column({ name: 'failed_reason', type: 'text', nullable: true })
  failedReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
