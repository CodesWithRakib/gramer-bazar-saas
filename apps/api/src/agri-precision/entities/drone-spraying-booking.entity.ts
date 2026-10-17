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
import { User } from '../../users/entities/user.entity.js';
import { DroneBookingStatus, DroneServiceType } from '../enums/agri-precision.enum.js';
import { DroneSprayingUnit } from './drone-spraying-unit.entity.js';

@Entity('drone_spraying_bookings')
@Index('idx_drone_booking_no', ['bookingNumber'], { unique: true })
@Index('idx_drone_booking_farmer', ['farmerId'])
@Index('idx_drone_booking_unit', ['droneUnitId'])
@Index('idx_drone_booking_status', ['status'])
export class DroneSprayingBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_number', type: 'varchar', length: 50, unique: true })
  bookingNumber: string; // e.g. DRN-2026-X892

  @Column({ name: 'farmer_id', type: 'uuid' })
  farmerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farmer_id' })
  farmer: Relation<User>;

  @Column({ name: 'farmer_name', type: 'varchar', length: 150 })
  farmerName: string;

  @Column({ name: 'farmer_phone', type: 'varchar', length: 30 })
  farmerPhone: string;

  @Column({ name: 'drone_unit_id', type: 'uuid' })
  droneUnitId: string;

  @ManyToOne(() => DroneSprayingUnit, (u) => u.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'drone_unit_id' })
  droneUnit: Relation<DroneSprayingUnit>;

  @Column({
    name: 'service_type',
    type: 'enum',
    enum: DroneServiceType,
  })
  serviceType: DroneServiceType;

  @Column({ name: 'target_crop', type: 'varchar', length: 100 })
  targetCrop: string; // e.g. Potato, Boro Rice, Maize

  @Column({ name: 'target_infestation_or_formula', type: 'varchar', length: 255 })
  targetInfestationOrFormula: string; // e.g. Late Blight Prevention (Mancozeb + Cymoxanil)

  @Column({ name: 'plot_address', type: 'text' })
  plotAddress: string;

  @Column({ name: 'plot_district', type: 'varchar', length: 100 })
  plotDistrict: string;

  @Column({ name: 'plot_upazila', type: 'varchar', length: 100 })
  plotUpazila: string;

  @Column({ name: 'land_area_bighas', type: 'decimal', precision: 8, scale: 2 })
  landAreaBighas: number; // e.g. 3.5 Bighas

  @Column({ name: 'service_rate_per_bigha', type: 'decimal', precision: 10, scale: 2 })
  serviceRatePerBigha: number; // e.g. 180 BDT

  @Column({ name: 'total_booking_cost', type: 'decimal', precision: 10, scale: 2 })
  totalBookingCost: number; // landAreaBighas * serviceRatePerBigha

  @Column({ name: 'scheduled_date', type: 'date' })
  scheduledDate: string; // e.g. 2026-11-15

  @Column({ name: 'scheduled_time_slot', type: 'varchar', length: 100 })
  scheduledTimeSlot: string; // e.g. 06:30 AM - 08:30 AM (Cool morning for zero wind drift)

  @Column({ name: 'gps_plot_center_lat', type: 'decimal', precision: 10, scale: 6, nullable: true })
  gpsPlotCenterLat: number | null;

  @Column({ name: 'gps_plot_center_lng', type: 'decimal', precision: 10, scale: 6, nullable: true })
  gpsPlotCenterLng: number | null;

  @Column({ name: 'flight_duration_minutes', type: 'int', nullable: true })
  flightDurationMinutes: number | null; // e.g. 18 minutes for 3 bighas

  @Column({ name: 'water_saved_liters', type: 'decimal', precision: 10, scale: 2, default: 0 })
  waterSavedLiters: number; // e.g. 480 Liters saved

  @Column({ name: 'pilot_mission_notes', type: 'text', nullable: true })
  pilotMissionNotes: string | null;

  @Column({
    type: 'enum',
    enum: DroneBookingStatus,
    default: DroneBookingStatus.REQUESTED,
  })
  status: DroneBookingStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
