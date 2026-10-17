import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChillingVatStatus } from '../enums/dairy-supply.enum.js';

@Entity('milk_chilling_vat_telemetry')
export class MilkChillingVatTelemetry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'vat_code', unique: true })
  vatCode!: string; // e.g. BMC-BAG-01, BMC-BERA-02

  @Column({ name: 'chilling_center_id' })
  chillingCenterId!: string;

  @Column({ name: 'chilling_center_name' })
  chillingCenterName!: string; // বাঘাবাড়ি মিল্ক চিলিং প্ল্যান্ট

  @Column({ name: 'district' })
  district!: string; // সিরাজগঞ্জ, পাবনা, নাটোর, সাতক্ষীরা

  @Column({ type: 'int', name: 'capacity_liters', default: 5000 })
  capacityLiters!: number; // ধারণক্ষমতা (যেমন ৫০০০ লিটার)

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'current_volume_liters' })
  currentVolumeLiters!: number; // বর্তমান মজুত (লিটার)

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'current_temperature_celsius' })
  currentTemperatureCelsius!: number; // লক্ষ্যমাত্রা: ৪.০ ডিগ্রি সেলসিয়াস

  @Column({ type: 'int', name: 'agitator_rpm', default: 32 })
  agitatorRpm!: number; // এজিটেটর ঘূর্ণন গতি (RPM)

  @Column({ name: 'compressor_status', default: 'RUNNING' })
  compressorStatus!: string; // RUNNING, IDLE, TRIPPED

  @Column({
    type: 'enum',
    enum: ChillingVatStatus,
    name: 'vat_status',
    default: ChillingVatStatus.OPTIMAL_CHILLED_4C,
  })
  vatStatus!: ChillingVatStatus;

  @Column({ type: 'boolean', name: 'is_alarm_active', default: false })
  isAlarmActive!: boolean;

  @Column({ name: 'alarm_reason', type: 'text', nullable: true })
  alarmReason!: string | null;

  @Column({ name: 'last_recorded_at', type: 'varchar' })
  lastRecordedAt!: string; // ISO 8601 string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
