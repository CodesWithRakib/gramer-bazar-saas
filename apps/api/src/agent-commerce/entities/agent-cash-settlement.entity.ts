import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { SettlementChannel, SettlementStatus } from '../enums/agent-commerce.enum.js';

@Entity('agent_cash_settlements')
export class AgentCashSettlement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'settlement_code', unique: true, length: 100 })
  settlementCode: string;

  @Column({ name: 'agent_id', type: 'uuid' })
  agentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent: User;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({
    name: 'settlement_channel',
    type: 'varchar',
    length: 50,
  })
  settlementChannel: SettlementChannel;

  @Column({ name: 'channel_reference', type: 'varchar', length: 255 })
  channelReference: string;

  @Column({ name: 'slip_receipt_url', type: 'text', nullable: true })
  slipReceiptUrl?: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: SettlementStatus.PENDING_REVIEW,
  })
  status: SettlementStatus;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string | null;

  @Column({ name: 'verified_by_admin_id', type: 'uuid', nullable: true })
  verifiedByAdminId?: string | null;

  @Column({
    name: 'verified_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  verifiedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
