import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { WalletTransaction } from './wallet-transaction.entity.js';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column({ name: 'pending_clearance', type: 'decimal', precision: 12, scale: 2, default: 0 })
  pendingClearance: number;

  @Column({ name: 'total_earned', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalEarned: number;

  @Column({ name: 'total_withdrawn', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalWithdrawn: number;

  @OneToMany(() => WalletTransaction, (tx) => tx.wallet, { cascade: true })
  transactions: Relation<WalletTransaction>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
