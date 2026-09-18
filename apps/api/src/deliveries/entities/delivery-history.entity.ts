import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { DeliveryStatus } from '../enums/delivery-status.enum.js';
import { Delivery } from './delivery.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('delivery_status_history')
export class DeliveryHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'delivery_id', type: 'uuid' })
  deliveryId: string;

  @ManyToOne(() => Delivery, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'delivery_id' })
  delivery: Relation<Delivery>;

  @Column({ type: 'enum', enum: DeliveryStatus })
  status: DeliveryStatus;

  @Column({ name: 'changed_by_id', type: 'uuid', nullable: true })
  changedById: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'changed_by_id' })
  changedBy: Relation<User> | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
