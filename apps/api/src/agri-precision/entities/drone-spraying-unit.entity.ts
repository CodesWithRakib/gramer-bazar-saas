import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { DroneSprayingBooking } from './drone-spraying-booking.entity.js';

@Entity('drone_spraying_units')
@Index('idx_drone_code', ['droneCode'], { unique: true })
@Index('idx_drone_pilot', ['pilotId'])
@Index('idx_drone_district', ['baseDistrict'])
export class DroneSprayingUnit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'drone_code', type: 'varchar', length: 50, unique: true })
  droneCode: string; // e.g. DRN-BGR-T40-01

  @Column({ name: 'pilot_id', type: 'uuid' })
  pilotId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pilot_id' })
  pilot: Relation<User>;

  @Column({ name: 'pilot_name', type: 'varchar', length: 150 })
  pilotName: string;

  @Column({ name: 'pilot_phone', type: 'varchar', length: 30 })
  pilotPhone: string;

  @Column({ name: 'pilot_license_no', type: 'varchar', length: 100 })
  pilotLicenseNo: string; // Civil Aviation / DAE Precision Drone Pilot License (e.g. CAAB-RPAS-2026-91)

  @Column({ name: 'drone_model', type: 'varchar', length: 100 })
  droneModel: string; // e.g. DJI Agras T40 (40L Tank, Dual Atomized Spraying)

  @Column({ name: 'tank_capacity_liters', type: 'decimal', precision: 5, scale: 2, default: 40.0 })
  tankCapacityLiters: number;

  @Column({ name: 'service_rate_per_bigha', type: 'decimal', precision: 10, scale: 2, default: 180.0 })
  serviceRatePerBigha: number; // ৳180 per Bigha (saves 50% cost vs manual labor)

  @Column({ name: 'base_district', type: 'varchar', length: 100 })
  baseDistrict: string;

  @Column({ name: 'base_upazila', type: 'varchar', length: 100 })
  baseUpazila: string;

  @Column({ name: 'coverage_radius_km', type: 'int', default: 30 })
  coverageRadiusKm: number;

  @Column({ name: 'total_acres_sprayed', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAcresSprayed: number;

  @Column({ name: 'water_saved_liters_estimated', type: 'decimal', precision: 12, scale: 2, default: 0 })
  waterSavedLitersEstimated: number; // 90% water saving compared to 200L/bigha manual spray

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;

  @OneToMany(() => DroneSprayingBooking, (b) => b.droneUnit)
  bookings: Relation<DroneSprayingBooking>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
