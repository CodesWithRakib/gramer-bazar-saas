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
import {
  BookingStatus,
  MachineryPaymentStatus,
  FuelOption,
  OperatorOption,
} from '../enums/machinery.enum.js';
import { MachineryItem } from './machinery-item.entity.js';
import { MachineryInspection } from './machinery-inspection.entity.js';

@Entity('machinery_bookings')
@Index('idx_machinery_booking_ref', ['bookingReference'], { unique: true })
@Index('idx_machinery_booking_renter', ['renterId'])
@Index('idx_machinery_booking_status', ['status'])
@Index('idx_machinery_booking_cluster', ['clusterTag'])
export class MachineryBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_reference', type: 'varchar', length: 50, unique: true })
  bookingReference: string; // e.g., MRENT-2026-X8B9

  @Column({ name: 'machinery_id', type: 'uuid' })
  machineryId: string;

  @ManyToOne(() => MachineryItem, (m) => m.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'machinery_id' })
  machinery: Relation<MachineryItem>;

  @Column({ name: 'renter_id', type: 'uuid' })
  renterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'renter_id' })
  renter: Relation<User>;

  @Column({ type: 'varchar', length: 150 })
  renterName: string;

  @Column({ type: 'varchar', length: 30 })
  renterPhone: string;

  @Column({ type: 'text' })
  plotAddress: string;

  @Column({ type: 'varchar', length: 100 })
  plotDistrict: string;

  @Column({ type: 'varchar', length: 100 })
  plotUpazila: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  plotUnion: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  plotVillage: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  plotSizeValue: number; // e.g. 3.5 Bighas, or 4.0 Hours

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalRentalFee: number; // baseRate * plotSizeValue

  @Column({
    type: 'enum',
    enum: FuelOption,
    default: FuelOption.FUEL_INCLUDED,
  })
  fuelOption: FuelOption;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fuelSurcharge: number;

  @Column({
    type: 'enum',
    enum: OperatorOption,
    default: OperatorOption.OPERATOR_INCLUDED,
  })
  operatorOption: OperatorOption;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  operatorFee: number;

  @Column({ type: 'boolean', default: false })
  isClusterDiscountApplied: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  clusterDiscountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  securityDeposit: number; // Escrow refundable hold

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  grandTotal: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({
    type: 'enum',
    enum: MachineryPaymentStatus,
    default: MachineryPaymentStatus.ESCROW_HOLD,
  })
  paymentStatus: MachineryPaymentStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  clusterTag: string | null; // e.g., "CLUSTER-DHAKA-SAVAR-20261018"

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string | null;

  @OneToMany(() => MachineryInspection, (i) => i.booking)
  inspections: Relation<MachineryInspection>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
