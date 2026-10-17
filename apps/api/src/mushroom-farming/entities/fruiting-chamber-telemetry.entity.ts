import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { FruitingChamberAlarmStatus } from '../enums/mushroom-farming.enum.js';

@Entity('fruiting_chamber_telemetries')
export class FruitingChamberTelemetry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  chamberCode!: string;

  @Column({ type: 'varchar', length: 150 })
  farmName!: string;

  @Column({ type: 'varchar', length: 60 })
  district!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  activeBatchNumber!: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 24.5 })
  temperatureCelsius!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 85.0 })
  relativeHumidityPercent!: number;

  @Column({ type: 'decimal', precision: 7, scale: 1, default: 820.0 })
  co2Ppm!: number;

  @Column({ type: 'varchar', length: 30, default: 'AUTO' })
  foggerMistState!: string;

  @Column({ type: 'varchar', length: 30, default: 'AUTO' })
  freshAirDamperState!: string;

  @Column({
    type: 'enum',
    enum: FruitingChamberAlarmStatus,
    default: FruitingChamberAlarmStatus.OPTIMAL_GROWTH_CLIMATE,
  })
  alarmStatus!: FruitingChamberAlarmStatus;

  @Column({ type: 'text', nullable: true })
  alarmMessage!: string | null;

  @Column({ type: 'varchar', length: 60 })
  lastRecordedAt!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
