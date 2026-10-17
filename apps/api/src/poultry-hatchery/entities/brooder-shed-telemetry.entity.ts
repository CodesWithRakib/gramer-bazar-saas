import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BrooderShedAlarmStatus } from '../enums/poultry-hatchery.enum.js';

@Entity('brooder_shed_telemetries')
export class BrooderShedTelemetry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'shed_code', unique: true })
  shedCode!: string; // e.g. SHED-GAZ-01, SHED-BGR-02

  @Column({ name: 'farm_name' })
  farmName!: string;

  @Column({ name: 'district' })
  district!: string;

  @Column({ name: 'flock_batch_code', nullable: true })
  flockBatchCode!: string | null;

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'temperature_celsius', default: 33.0 })
  temperatureCelsius!: number; // লক্ষ্যমাত্রা: ৩২.০ - ৩৫.০°C

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'relative_humidity_percent', default: 60.0 })
  relativeHumidityPercent!: number; // লক্ষ্যমাত্রা: ৫৫ - ৬৫%

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'ammonia_ppm', default: 12.0 })
  ammoniaPpm!: number; // লক্ষ্যমাত্রা: < ১৫ ppm (> ২৫ ppm হলে বিষাক্ত)

  @Column({ name: 'exhaust_fan_state', default: 'AUTO' })
  exhaustFanState!: string; // RUNNING, OFF, AUTO

  @Column({ name: 'brooder_heater_state', default: 'HEATING' })
  brooderHeaterState!: string; // HEATING, IDLE

  @Column({
    type: 'enum',
    enum: BrooderShedAlarmStatus,
    name: 'alarm_status',
    default: BrooderShedAlarmStatus.OPTIMAL_BROODING_ENVIRONMENT,
  })
  alarmStatus!: BrooderShedAlarmStatus;

  @Column({ name: 'alarm_message', type: 'text', nullable: true })
  alarmMessage!: string | null;

  @Column({ name: 'last_recorded_at', type: 'varchar' })
  lastRecordedAt!: string; // ISO string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
