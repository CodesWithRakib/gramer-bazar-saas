import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  AquacultureCategory,
  SpeciesName,
  HatcheryStage,
  PCRTestStatus,
} from '../enums/aquaculture.enum.js';

@Entity('hatchery_batches')
export class HatcheryBatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  hatcheryOwnerId!: string;

  @Column({ type: 'varchar', length: 255 })
  hatcheryName!: string;

  @Column({ type: 'varchar', length: 50 })
  hatcheryPhone!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  hatcheryDistrict!: string;

  @Column({ type: 'varchar', length: 100 })
  hatcheryUpazila!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  batchNumber!: string;

  @Column({
    type: 'enum',
    enum: AquacultureCategory,
    default: AquacultureCategory.FRESHWATER_CARP,
  })
  category!: AquacultureCategory;

  @Column({
    type: 'enum',
    enum: SpeciesName,
    default: SpeciesName.RUI_ROHU,
  })
  species!: SpeciesName;

  @Column({
    type: 'enum',
    enum: HatcheryStage,
    default: HatcheryStage.FINGERLING_DHANI,
  })
  stage!: HatcheryStage;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pcrTestReportNumber!: string | null;

  @Column({
    type: 'enum',
    enum: PCRTestStatus,
    default: PCRTestStatus.PCR_PENDING,
  })
  pcrTestStatus!: PCRTestStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  testingLab!: string | null;

  @Column({ type: 'int' })
  fingerlingCount!: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, default: 2.0 })
  averageLengthCm!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPriceBdt!: number;

  @Column({ type: 'int', default: 1000 })
  minOrderQuantity!: number;

  @Column({ type: 'boolean', default: true })
  oxygenPackingIncluded!: boolean;

  @Column({ type: 'boolean', default: true })
  isAvailable!: boolean;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
