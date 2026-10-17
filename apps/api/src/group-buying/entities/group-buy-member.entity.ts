import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { GroupBuyPool } from './group-buy-pool.entity.js';
import { GroupBuyPaymentMode } from '../enums/group-buying.enum.js';

@Entity('group_buy_members')
export class GroupBuyMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pool_id', type: 'uuid' })
  poolId: string;

  @ManyToOne(() => GroupBuyPool, (pool) => pool.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pool_id' })
  pool: GroupBuyPool;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({
    name: 'payment_mode',
    type: 'varchar',
    length: 50,
    default: GroupBuyPaymentMode.COD_PLEDGE,
  })
  paymentMode: GroupBuyPaymentMode;

  @Column({ name: 'is_leader', type: 'boolean', default: false })
  isLeader: boolean;

  @Column({ name: 'customer_name', type: 'varchar', length: 150 })
  customerName: string;

  @Column({ name: 'customer_phone', type: 'varchar', length: 20 })
  customerPhone: string;

  @Column({ name: 'delivery_address', type: 'varchar', length: 255 })
  deliveryAddress: string;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
