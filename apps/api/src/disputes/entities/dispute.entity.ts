import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { DisputeReason } from '../enums/dispute-reason.enum.js';
import { DisputeStatus } from '../enums/dispute-status.enum.js';
import type { DisputeMessage } from './dispute-message.entity.js';
import type { DisputeInternalNote } from './dispute-internal-note.entity.js';

@Entity('disputes')
export class Dispute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, { eager: true })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'uuid' })
  customerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column({ type: 'uuid' })
  sellerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column({ type: 'enum', enum: DisputeReason })
  reason: DisputeReason;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  evidenceImages: string[] | null;

  @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.OPEN })
  status: DisputeStatus;

  @Column({ type: 'text', nullable: true })
  adminDecision: string | null;

  @OneToMany('DisputeMessage', (message: DisputeMessage) => message.dispute)
  messages: DisputeMessage[];

  @OneToMany('DisputeInternalNote', (note: DisputeInternalNote) => note.dispute)
  internalNotes: DisputeInternalNote[];

  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  refundAmount: number | null;

  @Column({ name: 'requested_resolution', type: 'varchar', nullable: true })
  requestedResolution: string | null;

  @Column({ name: 'resolution_type', type: 'varchar', nullable: true })
  resolutionType: string | null; // e.g., 'FULL_REFUND', 'PARTIAL_REFUND', 'REPLACEMENT', 'REJECTED'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
