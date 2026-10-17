import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { LivestockTransportStatus } from '../enums/livestock.enum.js';

@Entity('livestock_transport_bookings')
export class LivestockTransportBooking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  bookingNumber!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  buyerId!: string;

  @Column({ type: 'varchar', length: 255 })
  buyerName!: string;

  @Column({ type: 'varchar', length: 50 })
  buyerPhone!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  livestockId!: string;

  @Column({ type: 'varchar', length: 50 })
  earTagNumber!: string;

  @Column({ type: 'varchar', length: 100 })
  pickupDistrict!: string;

  @Column({ type: 'varchar', length: 100 })
  pickupUpazila!: string;

  @Column({ type: 'varchar', length: 255 })
  pickupAddress!: string;

  @Column({ type: 'varchar', length: 100 })
  dropoffDistrict!: string;

  @Column({ type: 'varchar', length: 100 })
  dropoffUpazila!: string;

  @Column({ type: 'varchar', length: 255 })
  dropoffAddress!: string;

  @Column({ type: 'varchar', length: 100, default: 'Covered Pickup with Straw Bedding & Ramp' })
  vehicleType!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fareAmount!: number;

  @Column({ type: 'boolean', default: true })
  hasTransitInsurance!: boolean;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 500.0 })
  insuranceFee!: number;

  @Column({
    type: 'enum',
    enum: LivestockTransportStatus,
    default: LivestockTransportStatus.SCHEDULED,
  })
  status!: LivestockTransportStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  driverName!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  driverPhone!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vehiclePlateNumber!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
