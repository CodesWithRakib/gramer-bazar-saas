import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  type Relation,
} from 'typeorm';
import {
  CropType,
  AgriSeason,
  ParametricTriggerType,
  PolicyStatus,
} from '../enums/insurance.enum.js';
import { FarmerInsuranceEnrollment } from './farmer-insurance-enrollment.entity.js';

@Entity('crop_insurance_policies')
@Index('idx_policy_crop_season', ['cropType', 'season'])
@Index('idx_policy_target_district', ['targetDistrict'])
@Index('idx_policy_status', ['status'])
export class CropInsurancePolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'policy_code', type: 'varchar', length: 50, unique: true })
  policyCode: string; // e.g. POL-BORO-HAOR-2026

  @Column({ type: 'varchar', length: 255 })
  titleEn: string;

  @Column({ type: 'varchar', length: 255 })
  titleBn: string;

  @Column({ type: 'text', nullable: true })
  descriptionEn: string | null;

  @Column({ type: 'text', nullable: true })
  descriptionBn: string | null;

  @Column({
    type: 'enum',
    enum: CropType,
    default: CropType.BORO_PADDY,
  })
  cropType: CropType;

  @Column({
    type: 'enum',
    enum: AgriSeason,
    default: AgriSeason.RABI,
  })
  season: AgriSeason;

  @Column({ type: 'varchar', length: 100 })
  targetDistrict: string; // e.g. Sunamganj, Bogura, Satkhira

  @Column({ type: 'varchar', length: 100, nullable: true })
  targetUpazila: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sumInsuredPerBigha: number; // e.g., ৳15,000 per Bigha

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  premiumPerBigha: number; // Total actuarial premium, e.g., ৳300 per Bigha

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 50.0 })
  governmentSubsidyPct: number; // e.g. 50.00% government / co-op subsidy

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  farmerPayablePerBigha: number; // Net premium farmer pays, e.g. ৳150 per Bigha

  @Column({
    type: 'enum',
    enum: ParametricTriggerType,
    default: ParametricTriggerType.FLASH_FLOOD,
  })
  triggerType: ParametricTriggerType;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  triggerThresholdValue: number; // e.g. 150.0 (mm rainfall) or 65.0 (km/h wind)

  @Column({ type: 'varchar', length: 50 })
  triggerThresholdUnit: string; // 'mm', 'km/h', 'days', 'danger_mark_meters'

  @Column({ type: 'timestamp' })
  coverageStartDate: Date;

  @Column({ type: 'timestamp' })
  coverageEndDate: Date;

  @Column({
    type: 'enum',
    enum: PolicyStatus,
    default: PolicyStatus.ACTIVE,
  })
  status: PolicyStatus;

  @OneToMany(() => FarmerInsuranceEnrollment, (e) => e.policy)
  enrollments: Relation<FarmerInsuranceEnrollment>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
