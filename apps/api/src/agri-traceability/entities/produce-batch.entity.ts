import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import {
  CropType,
  ProduceGrade,
  PesticideUsage,
  BatchStatus,
  CheckpointStage,
} from '../enums/produce-traceability.enum.js';
import { User } from '../../users/entities/user.entity.js';
import { WarehouseHub } from '../../inventory/entities/warehouse-hub.entity.js';

export interface VisualAssessmentData {
  uniformityScore: number;
  surfaceDefectScore: number;
  colorScore: number;
  moistureScore: number;
  recommendationEn: string;
  recommendationBn: string;
  pricePremiumPercent: number;
}

export interface CheckpointLog {
  stage: CheckpointStage;
  timestamp: string;
  location: string;
  handlerName: string;
  temperatureC?: number;
  humidity?: number;
  notes?: string;
}

@Entity('produce_batches')
@Index('idx_produce_batches_seller_id', ['sellerId'])
@Index('idx_produce_batches_batch_number', ['batchNumber'], { unique: true })
@Index('idx_produce_batches_crop_type', ['cropType'])
@Index('idx_produce_batches_grade', ['qualityGrade'])
export class ProduceBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'batch_number', type: 'varchar', length: 50, unique: true })
  batchNumber: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seller_id' })
  seller: Relation<User>;

  @Column({
    name: 'crop_type',
    type: 'enum',
    enum: CropType,
    default: CropType.POTATO,
  })
  cropType: CropType;

  @Column({ type: 'varchar', length: 100 })
  variety: string;

  @Column({ name: 'harvest_date', type: 'date' })
  harvestDate: Date;

  @Column({ name: 'farm_location', type: 'varchar', length: 200 })
  farmLocation: string;

  @Column({ type: 'varchar', length: 100 })
  division: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'varchar', length: 100 })
  upazila: string;

  @Column({
    name: 'harvest_yield_kg',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  harvestYieldKg: number;

  @Column({
    name: 'available_kg',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  availableKg: number;

  @Column({
    name: 'quality_grade',
    type: 'enum',
    enum: ProduceGrade,
    default: ProduceGrade.GRADE_B,
  })
  qualityGrade: ProduceGrade;

  @Column({ name: 'quality_score', type: 'int', default: 75 })
  qualityScore: number;

  @Column({
    name: 'defect_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 5.0,
  })
  defectPercentage: number;

  @Column({ name: 'visual_assessment', type: 'jsonb', default: () => "'{}'" })
  visualAssessment: VisualAssessmentData;

  @Column({ name: 'organic_certified', type: 'boolean', default: false })
  organicCertified: boolean;

  @Column({
    name: 'pesticide_profile',
    type: 'enum',
    enum: PesticideUsage,
    default: PesticideUsage.INTEGRATED_PEST_MANAGEMENT,
  })
  pesticideProfile: PesticideUsage;

  @Column({ name: 'storage_hub_id', type: 'uuid', nullable: true })
  storageHubId: string | null;

  @ManyToOne(() => WarehouseHub, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'storage_hub_id' })
  storageHub: Relation<WarehouseHub> | null;

  @Column({
    type: 'enum',
    enum: BatchStatus,
    default: BatchStatus.GRADED,
  })
  status: BatchStatus;

  @Column({ name: 'qr_code_payload', type: 'varchar', length: 255 })
  qrCodePayload: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  checkpoints: CheckpointLog[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
