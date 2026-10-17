import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  LivestockCategory,
  LivestockBreed,
  LivestockListingStatus,
  VeterinaryHealthStatus,
  LivestockEscrowStatus,
} from '../enums/livestock.enum.js';

@Entity('livestock_listings')
export class LivestockListing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  sellerId!: string;

  @Column({ type: 'varchar', length: 255 })
  sellerName!: string;

  @Column({ type: 'varchar', length: 50 })
  sellerPhone!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  sellerDistrict!: string;

  @Column({ type: 'varchar', length: 100 })
  sellerUpazila!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  earTagNumber!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: LivestockCategory,
    default: LivestockCategory.DAIRY_COW,
  })
  category!: LivestockCategory;

  @Column({
    type: 'enum',
    enum: LivestockBreed,
    default: LivestockBreed.HOLSTEIN_FRIESIAN_CROSS,
  })
  breed!: LivestockBreed;

  @Column({ type: 'varchar', length: 20, default: 'FEMALE' })
  gender!: 'MALE' | 'FEMALE';

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  liveWeightKg!: number;

  @Column({ type: 'int', default: 2 })
  teethCount!: number;

  @Column({ type: 'int', default: 24 })
  ageMonths!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  dailyMilkYieldLiters!: number | null;

  @Column({ type: 'int', nullable: true })
  parity!: number | null;

  @Column({ type: 'boolean', default: false })
  isPregnant!: boolean;

  @Column({ type: 'int', nullable: true })
  pregnancyMonths!: number | null;

  @Column({ type: 'varchar', length: 100, default: 'Black & White' })
  colorPattern!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  askingPrice!: number;

  @Column({ type: 'boolean', default: true })
  negotiable!: boolean;

  @Column({ type: 'boolean', default: false })
  qurbaniEligible!: boolean;

  @Column({ type: 'simple-array', nullable: true })
  mediaUrls!: string[];

  @Column({
    type: 'enum',
    enum: VeterinaryHealthStatus,
    default: VeterinaryHealthStatus.PENDING_INSPECTION,
  })
  healthStatus!: VeterinaryHealthStatus;

  @Column({
    type: 'enum',
    enum: LivestockListingStatus,
    default: LivestockListingStatus.AVAILABLE,
  })
  listingStatus!: LivestockListingStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  buyerId!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  buyerName!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  buyerPhone!: string | null;

  @Column({
    type: 'enum',
    enum: LivestockEscrowStatus,
    nullable: true,
  })
  escrowStatus!: LivestockEscrowStatus | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  escrowAmount!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
