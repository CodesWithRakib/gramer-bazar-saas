import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { PaymentStatus, PaymentProvider } from '../enums/payment-status.enum.js';
import { Order } from '../../orders/entities/order.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id' })
  order: Relation<Order>;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({
    type: 'varchar',
    length: 50,
    default: PaymentProvider.SSLCOMMERZ,
  })
  provider: string;

  @Index({ unique: true })
  @Column({ name: 'transaction_id', type: 'varchar', length: 100, unique: true })
  transactionId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'BDT' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    enumName: 'payments_status_enum',
    default: PaymentStatus.INITIATED,
  })
  status: PaymentStatus;

  @Column({ name: 'gateway_status', type: 'varchar', length: 50, nullable: true })
  gatewayStatus: string | null;

  @Column({ name: 'validation_id', type: 'varchar', length: 100, nullable: true })
  validationId: string | null;

  @Column({ name: 'bank_transaction_id', type: 'varchar', length: 100, nullable: true })
  bankTransactionId: string | null;

  @Column({ name: 'risk_level', type: 'varchar', length: 20, nullable: true })
  riskLevel: string | null;

  @Column({ name: 'risk_title', type: 'varchar', length: 100, nullable: true })
  riskTitle: string | null;

  @Column({ name: 'card_type', type: 'varchar', length: 100, nullable: true })
  cardType: string | null;

  @Column({ name: 'card_brand', type: 'varchar', length: 100, nullable: true })
  cardBrand: string | null;

  @Column({ name: 'card_issuer', type: 'varchar', length: 100, nullable: true })
  cardIssuer: string | null;

  @Column({ name: 'gateway_response', type: 'jsonb', nullable: true })
  gatewayResponse: Record<string, any> | null;

  @Column({ name: 'paid_at', type: 'timestamp without time zone', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'failed_at', type: 'timestamp without time zone', nullable: true })
  failedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
