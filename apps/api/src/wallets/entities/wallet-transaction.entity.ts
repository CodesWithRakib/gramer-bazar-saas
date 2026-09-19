import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  type Relation,
} from 'typeorm';
import { Wallet } from './wallet.entity.js';

export enum TransactionType {
  CREDIT = 'CREDIT', // e.g., order earnings
  DEBIT = 'DEBIT', // e.g., payouts
}

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'wallet_id' })
  walletId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Relation<Wallet>;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 255 })
  description: string;

  @Column({ name: 'reference_id', type: 'varchar', nullable: true })
  referenceId: string | null; // e.g., Order ID or Payout ID

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
