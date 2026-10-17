import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { AIServiceStatus, LivestockBreed } from '../enums/livestock.enum.js';

@Entity('artificial_insemination_bookings')
export class ArtificialInseminationBooking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  bookingNumber!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  farmerId!: string;

  @Column({ type: 'varchar', length: 255 })
  farmerName!: string;

  @Column({ type: 'varchar', length: 50 })
  farmerPhone!: string;

  @Column({ type: 'varchar', length: 100 })
  farmerDistrict!: string;

  @Column({ type: 'varchar', length: 100 })
  farmerUpazila!: string;

  @Column({ type: 'varchar', length: 50 })
  targetDamEarTag!: string;

  @Column({
    type: 'enum',
    enum: LivestockBreed,
    default: LivestockBreed.LOCAL_DESHI,
  })
  targetDamBreed!: LivestockBreed;

  @Column({
    type: 'enum',
    enum: LivestockBreed,
    default: LivestockBreed.HOLSTEIN_FRIESIAN_CROSS,
  })
  desiredSireBreed!: LivestockBreed;

  @Column({ type: 'varchar', length: 255, default: 'Central Cattle Breeding & Dairy Farm, Savar' })
  strawSource!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sireBullId!: string | null;

  @Column({ type: 'varchar', length: 100 })
  heatObservationDate!: string;

  @Column({
    type: 'enum',
    enum: AIServiceStatus,
    default: AIServiceStatus.REQUESTED,
  })
  status!: AIServiceStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  technicianName!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  technicianPhone!: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 650.0 })
  fee!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  inseminationDate!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pregnancyCheckDate!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
