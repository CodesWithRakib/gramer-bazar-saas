import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { AgentSessionStatus } from '../enums/agent-commerce.enum.js';
import { AgentCashTransaction } from './agent-cash-transaction.entity.js';

@Entity('agent_cash_drawer_sessions')
export class AgentCashDrawerSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agent_id', type: 'uuid' })
  agentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent: User;

  @Column({ name: 'hub_id', type: 'uuid', nullable: true })
  hubId?: string | null;

  @Column({
    name: 'opened_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  openedAt: Date;

  @Column({
    name: 'closed_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  closedAt?: Date | null;

  @Column({
    name: 'opening_float',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  openingFloat: number;

  @Column({
    name: 'cash_in',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  cashIn: number;

  @Column({
    name: 'cash_out',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  cashOut: number;

  @Column({
    name: 'expected_closing_balance',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  expectedClosingBalance: number;

  @Column({
    name: 'actual_closing_balance',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  actualClosingBalance?: number | null;

  @Column({
    name: 'discrepancy',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  discrepancy?: number | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: AgentSessionStatus.OPEN,
  })
  status: AgentSessionStatus;

  @Column({ name: 'opening_notes', type: 'text', nullable: true })
  openingNotes?: string | null;

  @Column({ name: 'closing_notes', type: 'text', nullable: true })
  closingNotes?: string | null;

  @OneToMany(() => AgentCashTransaction, (tx) => tx.session)
  transactions: AgentCashTransaction[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
