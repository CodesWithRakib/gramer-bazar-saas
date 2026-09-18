import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DemandEventType } from '../enums/demand-event.enum.js';

@Entity('demand_events')
export class DemandEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'enum', enum: DemandEventType })
  eventType: DemandEventType;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  productId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  categoryId: string | null;

  @Column({ type: 'varchar', nullable: true })
  searchQuery: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  productRequestId: string | null;

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
