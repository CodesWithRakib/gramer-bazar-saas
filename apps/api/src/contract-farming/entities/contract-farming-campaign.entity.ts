import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { CampaignStatus, ContractCropType } from '../enums/contract-farming.enum.js';
import { ContractFarmingAgreement } from './contract-farming-agreement.entity.js';

@Entity('contract_farming_campaigns')
@Index('idx_campaign_code', ['campaignCode'], { unique: true })
@Index('idx_campaign_buyer', ['buyerId'])
@Index('idx_campaign_status', ['status'])
@Index('idx_campaign_crop', ['cropType'])
@Index('idx_campaign_district', ['targetDistrict'])
export class ContractFarmingCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'campaign_code', type: 'varchar', length: 50, unique: true })
  campaignCode: string; // e.g. CFC-2026-PRAN01

  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buyer_id' })
  buyer: Relation<User>;

  @Column({ name: 'buyer_company_name', type: 'varchar', length: 200 })
  buyerCompanyName: string; // e.g. PRAN Agro Ltd., Square Food & Beverage, Shwapno Superstore

  @Column({ name: 'title_en', type: 'varchar', length: 255 })
  titleEn: string;

  @Column({ name: 'title_bn', type: 'varchar', length: 255 })
  titleBn: string;

  @Column({ name: 'description_en', type: 'text' })
  descriptionEn: string;

  @Column({ name: 'description_bn', type: 'text' })
  descriptionBn: string;

  @Column({
    name: 'crop_type',
    type: 'enum',
    enum: ContractCropType,
  })
  cropType: ContractCropType;

  @Column({ name: 'target_season', type: 'varchar', length: 100 })
  targetSeason: string; // e.g. Rabi 2026, Kharif-1 2026

  @Column({ name: 'target_district', type: 'varchar', length: 100 })
  targetDistrict: string; // e.g. Bogura, Rangpur, Dinajpur

  @Column({ name: 'target_upazila', type: 'varchar', length: 100, nullable: true })
  targetUpazila: string | null;

  @Column({ name: 'target_total_acres', type: 'decimal', precision: 10, scale: 2 })
  targetTotalAcres: number;

  @Column({ name: 'current_enrolled_acres', type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentEnrolledAcres: number;

  @Column({ name: 'guaranteed_floor_price_per_kg', type: 'decimal', precision: 10, scale: 2 })
  guaranteedFloorPricePerKg: number; // e.g. 28.50 BDT/kg floor price guaranteed

  @Column({ name: 'advance_input_cash_pct', type: 'decimal', precision: 5, scale: 2, default: 25.0 })
  advanceInputCashPct: number; // 25% working capital disbursement upon seeding

  @Column({ name: 'estimated_yield_per_bigha_kg', type: 'decimal', precision: 10, scale: 2 })
  estimatedYieldPerBighaKg: number; // expected output per bigha

  @Column({ name: 'quality_standard_specs', type: 'text' })
  qualityStandardSpecs: string; // moisture < 18%, zero pesticide residue, diameter 45-65mm

  @Column({ name: 'intake_drop_warehouse_name', type: 'varchar', length: 255 })
  intakeDropWarehouseName: string; // e.g. Bogura PRAN Agro Hub Weighbridge Station

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.ENROLLING,
  })
  status: CampaignStatus;

  @OneToMany(() => ContractFarmingAgreement, (a) => a.campaign)
  agreements: Relation<ContractFarmingAgreement>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
