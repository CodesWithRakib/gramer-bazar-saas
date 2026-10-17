import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { SpeciesName, LiveFishTransportStatus } from '../enums/aquaculture.enum.js';

@Entity('live_fish_transport_bookings')
export class LiveFishTransportBooking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  bookingNumber!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  buyerId!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  farmerId!: string;

  @Column({ type: 'varchar', length: 100 })
  pickupDistrict!: string;

  @Column({ type: 'varchar', length: 100 })
  pickupUpazila!: string;

  @Column({ type: 'varchar', length: 255 })
  pickupGherAddress!: string;

  @Column({ type: 'varchar', length: 255 })
  dropoffMarket!: string;

  @Column({ type: 'varchar', length: 100, default: 'Specialized 3-Ton Aerated Water Tanker with O2 Diffusers' })
  vehicleType!: string;

  @Column({
    type: 'enum',
    enum: SpeciesName,
    default: SpeciesName.RUI_ROHU,
  })
  species!: SpeciesName;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  approximateFishKg!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  estimatedLivePriceBdt!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  transportFareBdt!: number;

  @Column({
    type: 'enum',
    enum: LiveFishTransportStatus,
    default: LiveFishTransportStatus.REQUESTED,
  })
  waterTankerStatus!: LiveFishTransportStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  driverName!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  driverPhone!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vehiclePlateNumber!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  departureTime!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
