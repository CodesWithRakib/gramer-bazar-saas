import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  GurType,
  HydrosulfiteTestResult,
  SugarSyrupAdulterationStatus,
  GurPurityGrade,
} from '../enums/artisanal-gur.enum.js';

@Entity('gur_purity_lab_tests')
export class GurPurityLabTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  testReportNumber: string;

  @Column({ nullable: true })
  batchId?: string;

  @Column({
    type: 'enum',
    enum: GurType,
    default: GurType.DATE_PALM_NOLEN_JHOLA,
  })
  gurType: GurType;

  @Column()
  sampleName: string;

  @Column({ default: 'BSTI Food & Chemical Testing Laboratory, Khulna' })
  testingLabName: string;

  @Column({ type: 'float', default: 68.5 })
  sucrosePct: number; // 65-75% for pure date palm gur; >85% indicates white sugar dilution

  @Column({ type: 'float', default: 12.8 })
  reducingSugarPct: number; // 10-15% natural glucose & fructose balance

  @Column({ type: 'float', default: 0.0 })
  hydrosulfitePpm: number; // Must be strictly 0.0 ppm (Zero-Tolerance)

  @Column({
    type: 'enum',
    enum: HydrosulfiteTestResult,
    default: HydrosulfiteTestResult.NEGATIVE_ZERO_TOLERANCE_PASS,
  })
  hydrosulfiteStatus: HydrosulfiteTestResult;

  @Column({
    type: 'enum',
    enum: SugarSyrupAdulterationStatus,
    default: SugarSyrupAdulterationStatus.GENUINE_PURE_SAP,
  })
  sugarAdulterationStatus: SugarSyrupAdulterationStatus;

  @Column({ default: false })
  isArtificialColoringDetected: boolean; // Banned Metanil Yellow or Orange-II synthetic dyes

  @Column({ type: 'float', default: 0.12 })
  leadPpm: number; // Heavy metal limit <= 0.50 ppm

  @Column({ type: 'float', default: 78.5 })
  totalSolubleSolidsBrix: number; // 76-82° Brix for liquid Jhola, >85° for solid Patali

  @Column({
    type: 'enum',
    enum: GurPurityGrade,
    default: GurPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
  })
  purityGrade: GurPurityGrade;

  @Column({ default: true })
  isGiCompliant: boolean; // Geographical Indication standards verification

  @Column({ default: true })
  isBstiApproved: boolean;

  @Column({ nullable: true })
  authenticitySealNumber?: string;

  @Column({ default: 'Dr. Anisur Rahman, Senior Food Technologist' })
  leadChemistName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
