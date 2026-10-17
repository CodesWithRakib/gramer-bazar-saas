import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ParametricTriggerType } from '../enums/insurance.enum.js';

@Entity('weather_trigger_telemetry')
@Index('idx_weather_district_upazila', ['district', 'upazila'])
@Index('idx_weather_trigger_type', ['triggerType'])
export class WeatherTriggerTelemetry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'varchar', length: 100 })
  upazila: string;

  @Column({ type: 'varchar', length: 150 })
  stationName: string; // e.g. "Sunamganj Surma River Gauge Station #4"

  @Column({
    type: 'enum',
    enum: ParametricTriggerType,
    default: ParametricTriggerType.FLASH_FLOOD,
  })
  triggerType: ParametricTriggerType;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  measuredValue: number;

  @Column({ type: 'varchar', length: 50 })
  unit: string;

  @Column({ type: 'boolean', default: false })
  isBreach: boolean;

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;
}
