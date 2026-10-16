import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { WarehouseHub } from './warehouse-hub.entity.js';

export enum TelemetrySensorType {
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',
  ETHYLENE_GAS = 'ETHYLENE_GAS',
  POWER_STATUS = 'POWER_STATUS',
}

export enum TelemetryStatus {
  OPTIMAL = 'OPTIMAL',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

@Entity('warehouse_telemetry')
export class WarehouseTelemetry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  hubId: string;

  @ManyToOne(() => WarehouseHub, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hubId' })
  hub: WarehouseHub;

  @Column({
    type: 'enum',
    enum: TelemetrySensorType,
    default: TelemetrySensorType.TEMPERATURE,
  })
  sensorType: TelemetrySensorType;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  value: number;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  @Column({
    type: 'enum',
    enum: TelemetryStatus,
    default: TelemetryStatus.OPTIMAL,
  })
  status: TelemetryStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;
}
