import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  SpiceType,
  AdulterationTestStatus,
  SpicePurityGrade,
} from '../enums/spice-market.enum.js';

@Entity('spice_purity_lab_tests')
export class SpicePurityLabTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  testReportNumber: string;

  @Column({ nullable: true })
  batchId?: string;

  @Column({
    type: 'enum',
    enum: SpiceType,
    default: SpiceType.CHILLI,
  })
  spiceType: SpiceType;

  @Column()
  sampleName: string;

  @Column({ default: 'BSTI National Chemical Testing Laboratory, Dhaka' })
  testingLabName: string;

  @Column({
    type: 'enum',
    enum: AdulterationTestStatus,
    default: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
  })
  sudanDyeStatus: AdulterationTestStatus;

  @Column({
    type: 'enum',
    enum: AdulterationTestStatus,
    default: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
  })
  leadChromateStatus: AdulterationTestStatus;

  @Column({
    type: 'enum',
    enum: AdulterationTestStatus,
    default: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
  })
  metanilYellowStatus: AdulterationTestStatus;

  @Column({ type: 'float', default: 9.1 })
  moisturePct: number;

  @Column({ type: 'float', default: 2.1 })
  aflatoxinB1Ppb: number;

  @Column({ type: 'float', nullable: true })
  curcuminPct?: number;

  @Column({ type: 'int', nullable: true })
  scovilleHeatUnits?: number;

  @Column({ type: 'float', nullable: true })
  essentialOilPct?: number;

  @Column({
    type: 'enum',
    enum: SpicePurityGrade,
    default: SpicePurityGrade.PURE_GRADE_AAA_EXPORT,
  })
  purityGrade: SpicePurityGrade;

  @Column({ default: true })
  certificateIssued: boolean;

  @Column({ nullable: true })
  authenticitySealNumber?: string;

  @Column({ default: 'Prof. Dr. Anwarul Karim' })
  leadChemistName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
