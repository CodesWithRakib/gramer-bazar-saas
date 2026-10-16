import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AgentCashDrawerSession } from './agent-cash-drawer-session.entity.js';
import { AgentCashTxType } from '../enums/agent-commerce.enum.js';

@Entity('agent_cash_transactions')
export class AgentCashTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => AgentCashDrawerSession, (session) => session.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: AgentCashDrawerSession;

  @Column({ type: 'varchar', length: 50 })
  type: AgentCashTxType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId?: string | null;

  @Column({ name: 'farmer_collection_id', type: 'uuid', nullable: true })
  farmerCollectionId?: string | null;

  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
