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
import { DispatchRunStatus, WaypointStatus } from '../enums/dispatch-run-status.enum.js';
import { User } from '../../users/entities/user.entity.js';
import { WarehouseHub } from '../../inventory/entities/warehouse-hub.entity.js';

export interface WaypointStop {
  sequence: number;
  deliveryId: string;
  orderId: string;
  orderNumber?: string;
  recipientName: string;
  recipientPhone: string;
  division: string;
  district: string;
  upazila: string;
  union?: string;
  villageAddress: string;
  lat?: number;
  lng?: number;
  codAmount: number;
  status: WaypointStatus;
  notes?: string;
  arrivedAt?: string;
  completedAt?: string;
}

@Entity('dispatch_clusters')
@Index('idx_dispatch_clusters_rider_id', ['riderId'])
@Index('idx_dispatch_clusters_status', ['status'])
@Index('idx_dispatch_clusters_district', ['district'])
export class DispatchCluster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'run_code', type: 'varchar', length: 50, unique: true })
  runCode: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ name: 'hub_id', type: 'uuid', nullable: true })
  hubId: string | null;

  @ManyToOne(() => WarehouseHub, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'hub_id' })
  hub: Relation<WarehouseHub> | null;

  @Column({ name: 'rider_id', type: 'uuid', nullable: true })
  riderId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'rider_id' })
  rider: Relation<User> | null;

  @Column({ type: 'varchar', length: 100 })
  division: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'varchar', length: 100 })
  upazila: string;

  @Column({
    type: 'enum',
    enum: DispatchRunStatus,
    default: DispatchRunStatus.PLANNED,
  })
  status: DispatchRunStatus;

  @Column({
    name: 'total_distance_km',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalDistanceKm: number;

  @Column({ name: 'estimated_duration_minutes', type: 'int', default: 0 })
  estimatedDurationMinutes: number;

  @Column({
    name: 'fuel_allowance_bdt',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  fuelAllowanceBdt: number;

  @Column({ name: 'requires_ferry_crossing', type: 'boolean', default: false })
  requiresFerryCrossing: boolean;

  @Column({ name: 'ferry_ghat_name', type: 'varchar', length: 150, nullable: true })
  ferryGhatName: string | null;

  @Column({ name: 'ferry_wait_minutes', type: 'int', default: 0 })
  ferryWaitMinutes: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  waypoints: WaypointStop[];

  @Column({ name: 'dispatched_at', type: 'timestamp', nullable: true })
  dispatchedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
