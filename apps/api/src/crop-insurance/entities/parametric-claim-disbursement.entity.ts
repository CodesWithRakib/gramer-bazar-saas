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
  ClaimDisasterSeverity,
  ClaimPayoutMethod,
} from '../enums/insurance.enum.js';
import { FarmerInsuranceEnrollment } from './farmer-insurance-enrollment.entity.js';

@Entity('parametric_claim_disbursements')
@Index('idx_claim_number', ['claimNumber'], { unique: true })
@Index('idx_claim_enrollment', ['enrollmentId'])
export class ParametricClaimDisbursement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'claim_number', type: 'varchar', length: 50, unique: true })
  claimNumber: string; // e.g. CLM-FLOOD-2026-081

  @Column({ name: 'enrollment_id', type: 'uuid' })
  enrollmentId: string;

  @ManyToOne(() => FarmerInsuranceEnrollment, (e) => e.claims, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Relation<FarmerInsuranceEnrollment>;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  triggerBreachValue: number; // e.g. 182.5 mm rainfall, or 3.2m above danger level

  @Column({ type: 'timestamp' })
  triggerBreachDate: Date;

  @Column({
    type: 'enum',
    enum: ClaimDisasterSeverity,
    default: ClaimDisasterSeverity.TOTAL_LOSS,
  })
  disasterSeverity: ClaimDisasterSeverity;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100.0 })
  damagePct: number; // e.g. 25%, 50%, 75%, 100%

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  payoutAmount: number; // totalSumInsured * (damagePct / 100)

  @Column({
    type: 'enum',
    enum: ClaimPayoutMethod,
    default: ClaimPayoutMethod.BKASH,
  })
  payoutMethod: ClaimPayoutMethod;

  @Column({ type: 'varchar', length: 100, nullable: true })
  payoutTransactionRef: string | null; // e.g. BKASH-TRX-91J2

  @Column({ type: 'boolean', default: true })
  isAutomatedTrigger: boolean; // true if auto-detected by station breach, false if manual claim

  @Column({ type: 'text', nullable: true })
  farmerDamageNotes: string | null;

  @Column({ type: 'simple-array', nullable: true })
  damagePhotos: string[] | null;

  @Column({ type: 'text', nullable: true })
  adminApprovalNotes: string | null;

  @Column({ type: 'timestamp', nullable: true })
  disbursedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
