import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { SpeciesName } from '../enums/aquaculture.enum.js';

@Entity('feed_fcr_logs')
export class FeedFcrLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  farmerId!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  pondId!: string;

  @Column({
    type: 'enum',
    enum: SpeciesName,
    default: SpeciesName.MONOSEX_TILAPIA,
  })
  species!: SpeciesName;

  @Column({ type: 'varchar', length: 50 })
  stockingDate!: string;

  @Column({ type: 'varchar', length: 255 })
  feedBrand!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cumulativeFeedKg!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  estimatedBiomassKg!: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  calculatedFcr!: number;

  @Column({ type: 'decimal', precision: 6, scale: 1 })
  averageBodyWeightGrams!: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, default: 85.0 })
  survivalRatePercentage!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'varchar', length: 50 })
  recordedDate!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
