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
  MachineryCategory,
  PricingBasis,
  FuelOption,
  OperatorOption,
  MachineryStatus,
} from '../enums/machinery.enum.js';
import { MachineryBooking } from './machinery-booking.entity.js';
import { MachineryInspection } from './machinery-inspection.entity.js';

@Entity('machinery_items')
@Index('idx_machinery_district_upazila', ['district', 'upazila'])
@Index('idx_machinery_category', ['category'])
@Index('idx_machinery_status', ['status'])
export class MachineryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: Relation<User>;

  @Column({ type: 'varchar', length: 255 })
  titleEn: string;

  @Column({ type: 'varchar', length: 255 })
  titleBn: string;

  @Column({ type: 'text', nullable: true })
  descriptionEn: string | null;

  @Column({ type: 'text', nullable: true })
  descriptionBn: string | null;

  @Column({
    type: 'enum',
    enum: MachineryCategory,
    default: MachineryCategory.POWER_TILLER,
  })
  category: MachineryCategory;

  @Column({ type: 'varchar', length: 150, nullable: true })
  modelNumber: string | null;

  @Column({
    type: 'enum',
    enum: PricingBasis,
    default: PricingBasis.PER_BIGHA,
  })
  pricingBasis: PricingBasis;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseRate: number; // e.g., 1200 BDT per Bigha, or 500 BDT per Hour

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  securityDeposit: number; // Escrow refundable damage deposit

  @Column({
    type: 'enum',
    enum: FuelOption,
    default: FuelOption.FUEL_INCLUDED,
  })
  fuelOption: FuelOption;

  @Column({
    type: 'enum',
    enum: OperatorOption,
    default: OperatorOption.OPERATOR_INCLUDED,
  })
  operatorOption: OperatorOption;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  operatorDailyAllowance: number;

  @Column({
    type: 'enum',
    enum: MachineryStatus,
    default: MachineryStatus.AVAILABLE,
  })
  status: MachineryStatus;

  @Column({ type: 'simple-array', nullable: true })
  images: string[] | null;

  @Column({ type: 'varchar', length: 100 })
  division: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'varchar', length: 100 })
  upazila: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  union: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  village: string | null;

  @Column({ type: 'int', default: 15 })
  serviceRadiusKm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.0 })
  neighborClusterDiscountPct: number; // e.g. 10.00% discount if neighboring plots pool bookings

  @OneToMany(() => MachineryBooking, (b) => b.machinery)
  bookings: Relation<MachineryBooking>[];

  @OneToMany(() => MachineryInspection, (i) => i.machinery)
  inspections: Relation<MachineryInspection>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
