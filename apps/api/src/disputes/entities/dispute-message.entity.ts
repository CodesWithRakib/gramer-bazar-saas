import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Dispute } from './dispute.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('dispute_messages')
export class DisputeMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  disputeId: string;

  @ManyToOne(() => Dispute, (dispute) => dispute.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'disputeId' })
  dispute: Dispute;

  @Column({ type: 'uuid' })
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column({ type: 'varchar' })
  senderRole: string; // 'CUSTOMER', 'SELLER', 'ADMIN'

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', nullable: true })
  attachment: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
