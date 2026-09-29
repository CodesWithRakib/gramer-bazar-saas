import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { RiderAvailability } from '../enums/rider-availability.enum.js';

/**
 * Operational rider profile. Created from an approved `RiderApplication` and
 * owned by the rider user. Verified identity fields (NID, driving license) are
 * read-only through rider-facing APIs; only availability and contact/vehicle
 * details can be self-service updated.
 */
@Entity('rider_profiles')
@Index('idx_rider_profiles_availability', ['availability'])
export class RiderProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ name: 'full_name', type: 'varchar', length: 150, nullable: true })
  fullName: string | null;

  @Column({ name: 'nid_number', type: 'varchar', length: 50, nullable: true })
  nidNumber: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'preferred_zone', type: 'varchar', length: 150, nullable: true })
  preferredZone: string | null;

  @Column({ name: 'emergency_contact', type: 'varchar', length: 50, nullable: true })
  emergencyContact: string | null;

  @Column({ name: 'vehicle_type', type: 'varchar', length: 50, default: 'BIKE' })
  vehicleType: string;

  @Column({ name: 'vehicle_plate_number', type: 'varchar', length: 100, nullable: true })
  vehiclePlateNumber: string | null;

  @Column({ name: 'driving_license_number', type: 'varchar', length: 100, nullable: true })
  drivingLicenseNumber: string | null;

  @Column({
    type: 'enum',
    enum: RiderAvailability,
    default: RiderAvailability.OFFLINE,
  })
  availability: RiderAvailability;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'last_available_at', type: 'timestamp', nullable: true })
  lastAvailableAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
