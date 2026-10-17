import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import {
  HerbalSpecies,
  PlantPartUsed,
  ProcessingState,
  GACPStandardGrade,
  LabCertificateStatus,
} from '../enums/herbal-supply.enum.js';
import { HerbalMoistureAudit } from './herbal-moisture-audit.entity.js';

@Entity('herbal_batches')
export class HerbalBatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'grower_id' })
  growerId!: string;

  @Column({ name: 'cooperative_name' })
  cooperativeName!: string;

  @Column({ name: 'grower_phone' })
  growerPhone!: string;

  @Column({ name: 'grower_district' })
  growerDistrict!: string;

  @Column({ name: 'grower_upazila' })
  growerUpazila!: string;

  @Column({ name: 'batch_number', unique: true })
  batchNumber!: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: HerbalSpecies.KALOMEGH,
  })
  species!: HerbalSpecies;

  @Column({ name: 'scientific_name' })
  scientificName!: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: PlantPartUsed.LEAF_DRIED,
  })
  plantPart!: PlantPartUsed;

  @Column({
    type: 'varchar',
    length: 50,
    default: ProcessingState.SHADE_DRIED_WHOLE,
  })
  processingState!: ProcessingState;

  @Column({ name: 'harvested_date' })
  harvestedDate!: string; // YYYY-MM-DD

  @Column({ name: 'total_weight_kg', type: 'decimal', precision: 10, scale: 2 })
  totalWeightKg!: number;

  @Column({ name: 'moisture_content_percentage', type: 'decimal', precision: 5, scale: 2, default: 9.5 })
  moistureContentPercentage!: number;

  @Column({ name: 'active_phytochemical_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  activePhytochemicalPercentage!: number | null; // e.g. 2.4% Andrographolide

  @Column({ name: 'phytochemical_marker_name', nullable: true })
  phytochemicalMarkerName!: string | null;

  @Column({ name: 'lab_report_number', nullable: true })
  labReportNumber!: string | null;

  @Column({ name: 'testing_laboratory', nullable: true })
  testingLaboratory!: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: GACPStandardGrade.PHARMA_GRADE_A,
  })
  gacpGrade!: GACPStandardGrade;

  @Column({
    type: 'varchar',
    length: 50,
    default: LabCertificateStatus.TESTED_COMPLIANT_DGDA,
  })
  certStatus!: LabCertificateStatus;

  @Column({ name: 'price_per_kg_bdt', type: 'decimal', precision: 10, scale: 2 })
  pricePerKgBdt!: number;

  @Column({ name: 'min_order_kg', type: 'int', default: 20 })
  minOrderKg!: number;

  @Column({ name: 'is_organic_certified', default: true })
  isOrganicCertified!: boolean;

  @Column({ name: 'storage_warehouse_conditions', nullable: true })
  storageWarehouseConditions!: string | null; // e.g. "Dehumidified below 45% RH, shaded pallet storage"

  @Column({ name: 'is_available', default: true })
  isAvailable!: boolean;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @OneToMany(() => HerbalMoistureAudit, (audit) => audit.batch)
  audits!: HerbalMoistureAudit[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
