import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { PondWaterQualityStatus } from '../enums/aquaculture.enum.js';

@Entity('pond_iot_telemetry')
export class PondIotTelemetry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  farmerId!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  pondId!: string;

  @Column({ type: 'varchar', length: 255 })
  pondName!: string;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  dissolvedOxygenMgL!: number;

  @Column({ type: 'decimal', precision: 4, scale: 1 })
  waterTemperatureCelsius!: number;

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  waterPh!: number;

  @Column({ type: 'decimal', precision: 5, scale: 3 })
  ammoniaNh3Ppm!: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, default: 0.0 })
  salinityPpt!: number;

  @Column({
    type: 'enum',
    enum: PondWaterQualityStatus,
    default: PondWaterQualityStatus.OPTIMAL,
  })
  waterQualityStatus!: PondWaterQualityStatus;

  @Column({ type: 'boolean', default: false })
  aeratorsActive!: boolean;

  @Column({ type: 'text', nullable: true })
  alertMessage!: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
