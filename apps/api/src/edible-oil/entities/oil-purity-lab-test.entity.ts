import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  OilSeedType,
  ArgemoneTestResult,
  AdulterationScreeningStatus,
  OilPurityGrade,
} from '../enums/edible-oil.enum.js';

@Entity('oil_purity_lab_tests')
export class OilPurityLabTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  testReportNumber: string;

  @Column({ nullable: true })
  batchId?: string;

  @Column({
    type: 'enum',
    enum: OilSeedType,
    default: OilSeedType.MUSTARD_MAGHI_DESHI,
  })
  seedType: OilSeedType;

  @Column()
  sampleName: string;

  @Column({ default: 'BSTI Physical & Chemical Testing Laboratory, Dhaka' })
  testingLabName: string;

  @Column({ type: 'float', default: 0.85 })
  freeFattyAcidPct: number; // FFA <= 1.50% standard

  @Column({ type: 'float', default: 3.2 })
  peroxideValueMeq: number; // POV <= 10.0 meq O2/kg

  @Column({ type: 'float', default: 0.38 })
  allylIsothiocyanatePct: number; // Natural pungency compound (>= 0.25%)

  @Column({
    type: 'enum',
    enum: ArgemoneTestResult,
    default: ArgemoneTestResult.NEGATIVE_PASS_SAFE,
  })
  argemoneOilStatus: ArgemoneTestResult;

  @Column({
    type: 'enum',
    enum: AdulterationScreeningStatus,
    default: AdulterationScreeningStatus.PURE_UNADULTERATED,
  })
  adulterationStatus: AdulterationScreeningStatus;

  @Column({ type: 'float', default: 1.465 })
  refractiveIndex: number; // 1.465 - 1.469 at 40°C for pure mustard

  @Column({
    type: 'enum',
    enum: OilPurityGrade,
    default: OilPurityGrade.GRADE_AAA_EXTRA_VIRGIN_COLD_PRESSED,
  })
  purityGrade: OilPurityGrade;

  @Column({ default: true })
  isBstiApproved: boolean;

  @Column({ nullable: true })
  authenticitySealNumber?: string;

  @Column({ default: 'Dr. Shahabuddin Ahmed, Lead Analytical Chemist' })
  leadChemistName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
