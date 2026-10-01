import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { Dispute } from './dispute.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('dispute_internal_notes')
export class DisputeInternalNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dispute_id', type: 'uuid' })
  disputeId: string;

  @ManyToOne(() => Dispute, (dispute) => dispute.internalNotes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dispute_id' })
  dispute: Relation<Dispute>;

  @Column({ name: 'created_by_id', type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: Relation<User>;

  @Column({ type: 'text' })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
