import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { InspectionType } from '../enums/machinery.enum.js';
import { MachineryItem } from './machinery-item.entity.js';
import { MachineryBooking } from './machinery-booking.entity.js';

@Entity('machinery_inspections')
@Index('idx_machinery_inspection_booking', ['bookingId'])
@Index('idx_machinery_inspection_machinery', ['machineryId'])
export class MachineryInspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => MachineryBooking, (b) => b.inspections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Relation<MachineryBooking>;

  @Column({ name: 'machinery_id', type: 'uuid' })
  machineryId: string;

  @ManyToOne(() => MachineryItem, (m) => m.inspections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'machinery_id' })
  machinery: Relation<MachineryItem>;

  @Column({ name: 'inspector_id', type: 'uuid' })
  inspectorId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'inspector_id' })
  inspector: Relation<User>;

  @Column({
    type: 'enum',
    enum: InspectionType,
    default: InspectionType.PRE_DISPATCH,
  })
  inspectionType: InspectionType;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  meterHours: number; // Machine engine run hours

  @Column({ type: 'int', default: 100 })
  fuelLevelPct: number; // 0 - 100%

  @Column({ type: 'boolean', default: true })
  isEngineOperational: boolean;

  @Column({ type: 'boolean', default: true })
  isOperational: boolean; // Tillage tines, cutting bar, pump impeller, or drone rotors

  @Column({ type: 'text', nullable: true })
  damageNotes: string | null;

  @Column({ type: 'simple-array', nullable: true })
  damagePhotos: string[] | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  claimDamageDeduction: number; // Amount deducted from security deposit if damage occurred

  @Column({ type: 'boolean', default: false })
  isApprovedByRenter: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
