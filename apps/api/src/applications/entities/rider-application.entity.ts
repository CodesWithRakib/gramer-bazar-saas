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

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ name: 'full_name', length: 150 })
  fullName: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 150, nullable: true })
  email: string | null;

  @Column({ name: 'nid_number', length: 50 })
  nidNumber: string;

  @Column({ name: 'vehicle_type', length: 50, default: 'BIKE' })
  vehicleType: string;

  @Column({ name: 'vehicle_plate_number', length: 100, nullable: true })
  vehiclePlateNumber: string | null;

  @Column({ name: 'driving_license_number', length: 100, nullable: true })
  drivingLicenseNumber: string | null;

  @Column({ name: 'preferred_zone', length: 150, nullable: true })
  preferredZone: string | null;

  @Column({ name: 'emergency_contact', length: 50, nullable: true })
  emergencyContact: string | null;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null;

  @Column({ name: 'reviewer_id', nullable: true })
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
