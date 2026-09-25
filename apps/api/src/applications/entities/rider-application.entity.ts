import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { ApplicationStatus } from '../enums/application-status.enum.js';

@Entity('rider_applications')
export class RiderApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ name: 'nid_number', type: 'varchar', length: 50 })
  nidNumber: string;

  @Column({ name: 'vehicle_type', type: 'varchar', length: 50, default: 'BIKE' })
  vehicleType: string;

  @Column({ name: 'vehicle_plate_number', type: 'varchar', length: 100, nullable: true })
  vehiclePlateNumber: string | null;

  @Column({ name: 'driving_license_number', type: 'varchar', length: 100, nullable: true })
  drivingLicenseNumber: string | null;

  @Column({ name: 'preferred_zone', type: 'varchar', length: 150, nullable: true })
  preferredZone: string | null;

  @Column({ name: 'emergency_contact', type: 'varchar', length: 50, nullable: true })
  emergencyContact: string | null;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null;

  @Column({ name: 'reviewer_id', type: 'uuid', nullable: true })
  reviewerId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: Relation<User> | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
