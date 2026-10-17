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
import { AgreementStatus } from '../enums/contract-farming.enum.js';
import { ContractFarmingCampaign } from './contract-farming-campaign.entity.js';
import { ContractMilestoneInspection } from './contract-milestone-inspection.entity.js';
import { ContractHarvestDelivery } from './contract-harvest-delivery.entity.js';

@Entity('contract_farming_agreements')
@Index('idx_agreement_number', ['agreementNumber'], { unique: true })
@Index('idx_agreement_campaign', ['campaignId'])
@Index('idx_agreement_farmer', ['farmerId'])
@Index('idx_agreement_status', ['status'])
export class ContractFarmingAgreement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agreement_number', type: 'varchar', length: 50, unique: true })
  agreementNumber: string; // e.g. AGR-2026-N9F1

  @Column({ name: 'campaign_id', type: 'uuid' })
  campaignId: string;

  @ManyToOne(() => ContractFarmingCampaign, (c) => c.agreements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Relation<ContractFarmingCampaign>;

  @Column({ name: 'farmer_id', type: 'uuid' })
  farmerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farmer_id' })
  farmer: Relation<User>;

  @Column({ name: 'farmer_name', type: 'varchar', length: 150 })
  farmerName: string;

  @Column({ name: 'farmer_phone', type: 'varchar', length: 30 })
  farmerPhone: string;

  @Column({ name: 'farmer_nid', type: 'varchar', length: 30, nullable: true })
  farmerNid: string | null;

  @Column({ name: 'plot_address', type: 'text' })
  plotAddress: string;

  @Column({ name: 'plot_district', type: 'varchar', length: 100 })
  plotDistrict: string;

  @Column({ name: 'plot_upazila', type: 'varchar', length: 100 })
  plotUpazila: string;

  @Column({ name: 'plot_union', type: 'varchar', length: 150, nullable: true })
  plotUnion: string | null;

  @Column({ name: 'plot_village', type: 'varchar', length: 150, nullable: true })
  plotVillage: string | null;

  @Column({ name: 'plot_dag_no', type: 'varchar', length: 100, nullable: true })
  plotDagNo: string | null;

  @Column({ name: 'land_area_bighas', type: 'decimal', precision: 8, scale: 2 })
  landAreaBighas: number; // e.g. 3.0 Bighas

  @Column({ name: 'committed_est_production_kg', type: 'decimal', precision: 10, scale: 2 })
  committedEstProductionKg: number; // e.g. 3600 kg

  @Column({ name: 'floor_price_per_kg', type: 'decimal', precision: 10, scale: 2 })
  floorPricePerKg: number; // e.g. 28.50 BDT/kg

  @Column({ name: 'total_est_agreement_value', type: 'decimal', precision: 12, scale: 2 })
  totalEstAgreementValue: number; // committedEstProductionKg * floorPricePerKg

  @Column({
    name: 'advance_working_capital_disbursed',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  advanceWorkingCapitalDisbursed: number; // e.g. 25% released into farmer's wallet upon approval

  @Column({ name: 'delivered_total_kg', type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveredTotalKg: number;

  @Column({ name: 'final_settled_value', type: 'decimal', precision: 12, scale: 2, default: 0 })
  finalSettledValue: number;

  @Column({ name: 'balance_payable', type: 'decimal', precision: 12, scale: 2, default: 0 })
  balancePayable: number; // finalSettledValue - advanceWorkingCapitalDisbursed

  @Column({ name: 'farmer_payout_mfs_or_bank', type: 'varchar', length: 50 })
  farmerPayoutMfsOrBank: string; // bKash / Nagad / Bank Account for advance & final settlement

  @Column({
    type: 'enum',
    enum: AgreementStatus,
    default: AgreementStatus.APPLIED,
  })
  status: AgreementStatus;

  @OneToMany(() => ContractMilestoneInspection, (i) => i.agreement)
  inspections: Relation<ContractMilestoneInspection>[];

  @OneToMany(() => ContractHarvestDelivery, (d) => d.agreement)
  deliveries: Relation<ContractHarvestDelivery>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
