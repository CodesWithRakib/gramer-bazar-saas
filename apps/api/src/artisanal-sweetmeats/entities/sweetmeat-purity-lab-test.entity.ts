import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  SweetmeatType,
  StarchAdulterationTest,
  SweetmeatPurityGrade,
} from '../enums/artisanal-sweetmeats.enum.js';

@Entity('sweetmeat_purity_lab_tests')
export class SweetmeatPurityLabTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  testReportNumber: string;

  @Column({ nullable: true })
  batchId?: string;

  @Column({
    type: 'enum',
    enum: SweetmeatType,
    default: SweetmeatType.BOGURA_SPECIAL_CURD_DOI,
  })
  sweetmeatType: SweetmeatType;

  @Column()
  sampleName: string;

  @Column({ default: 'BSTI Food & Dairy Testing Laboratory, Rajshahi' })
  testingLabName: string;

  @Column({ type: 'float', default: 28.5 })
  milkFatDryMatterPct: number; // >=25% cow, >=30% buffalo chhana

  @Column({ type: 'float', default: 52.0 })
  moisturePct: number; // 50-55% for soft sweets

  @Column({
    type: 'enum',
    enum: StarchAdulterationTest,
    default: StarchAdulterationTest.NEGATIVE_ZERO_TOLERANCE_PASS,
  })
  starchAdulterationStatus: StarchAdulterationTest; // Zero-tolerance Iodine test

  @Column({ default: false })
  isDetergentOrUreaDetected: boolean; // Zero tolerance synthetic milk additives

  @Column({ default: false })
  isHydrogenatedFatVanaspatiDetected: boolean; // Baudouin test for Dalda/Vanaspati

  @Column({ default: false })
  isArtificialColoringDetected: boolean; // Banned Metanil Yellow / Auramine

  @Column({ type: 'float', default: 0.85 })
  totalAcidityLacticPct: number;

  @Column({ type: 'float', default: 9.5 })
  sensoryTasteScore: number; // 1-10 scale

  @Column({
    type: 'enum',
    enum: SweetmeatPurityGrade,
    default: SweetmeatPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
  })
  purityGrade: SweetmeatPurityGrade;

  @Column({ default: true })
  isBstiApproved: boolean;

  @Column({ default: true })
  isGiCompliant: boolean;

  @Column({ nullable: true })
  authenticitySealNumber?: string;

  @Column()
  leadChemistName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
