import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { DeliveryGrade } from '../enums/contract-farming.enum.js';
import { ContractFarmingAgreement } from './contract-farming-agreement.entity.js';

@Entity('contract_harvest_deliveries')
@Index('idx_delivery_voucher', ['deliveryVoucherNo'], { unique: true })
@Index('idx_delivery_agreement', ['agreementId'])
export class ContractHarvestDelivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'delivery_voucher_no', type: 'varchar', length: 50, unique: true })
  deliveryVoucherNo: string; // e.g. VCH-2026-H891

  @Column({ name: 'agreement_id', type: 'uuid' })
  agreementId: string;

  @ManyToOne(() => ContractFarmingAgreement, (a) => a.deliveries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agreement_id' })
  agreement: Relation<ContractFarmingAgreement>;

  @Column({ name: 'gross_weight_kg', type: 'decimal', precision: 10, scale: 2 })
  grossWeightKg: number; // e.g. truck + cargo = 5,400 kg

  @Column({ name: 'tare_weight_kg', type: 'decimal', precision: 10, scale: 2 })
  tareWeightKg: number; // e.g. empty truck = 2,200 kg

  @Column({ name: 'net_weight_kg', type: 'decimal', precision: 10, scale: 2 })
  netWeightKg: number; // e.g. 3,200 kg net cargo

  @Column({
    name: 'accepted_grade',
    type: 'enum',
    enum: DeliveryGrade,
    default: DeliveryGrade.GRADE_B,
  })
  acceptedGrade: DeliveryGrade;

  @Column({ name: 'quality_moisture_pct', type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityMoisturePct: number | null; // e.g. 14.5%

  @Column({ name: 'final_price_per_kg', type: 'decimal', precision: 10, scale: 2 })
  finalPricePerKg: number; // calculated according to Grade A/B/C bonuses/deductions

  @Column({ name: 'payable_batch_amount', type: 'decimal', precision: 12, scale: 2 })
  payableBatchAmount: number; // netWeightKg * finalPricePerKg

  @Column({ name: 'weighbridge_slip_photo', type: 'text', nullable: true })
  weighbridgeSlipPhoto: string | null;

  @Column({ name: 'weighbridge_operator_name', type: 'varchar', length: 150 })
  weighbridgeOperatorName: string;

  @Column({ name: 'is_disbursed', type: 'boolean', default: false })
  isDisbursed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
