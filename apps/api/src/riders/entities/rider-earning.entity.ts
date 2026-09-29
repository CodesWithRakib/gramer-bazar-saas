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
import { Delivery } from '../../deliveries/entities/delivery.entity.js';
import { Order } from '../../orders/entities/order.entity.js';
import { PayoutRequest } from '../../payouts/entities/payout-request.entity.js';
import { RiderEarningStatus } from '../enums/rider-earning-status.enum.js';

/**
 * Immutable ledger entry credited to a rider for each completed delivery.
 * The amount is the delivery fee the customer was charged for that order.
 * One earning row is created per delivery (unique `delivery_id` guard).
 */
@Entity('rider_earnings')
@Index('idx_rider_earnings_rider_id', ['riderId'])
@Index('idx_rider_earnings_status', ['status'])
@Index('idx_rider_earnings_created_at', ['createdAt'])
export class RiderEarning {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'rider_id', type: 'uuid' })
  riderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rider_id' })
  rider: Relation<User>;

  @Column({ name: 'delivery_id', type: 'uuid', unique: true })
  deliveryId: string;

  @ManyToOne(() => Delivery, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'delivery_id' })
  delivery: Relation<Delivery>;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Relation<Order>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: RiderEarningStatus, default: RiderEarningStatus.EARNED })
  status: RiderEarningStatus;

  @Column({ name: 'payout_id', type: 'uuid', nullable: true })
  payoutId: string | null;

  @ManyToOne(() => PayoutRequest, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payout_id' })
  payout: Relation<PayoutRequest> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
