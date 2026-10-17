import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  JuteVariety,
  JuteFiberGrade,
  BaleType,
  BalingEscrowStatus,
} from '../enums/jute-biotech.enum.js';

@Entity('jute_fiber_lots')
export class JuteFiberLot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  lotNumber!: string;

  @Column({ type: 'varchar', length: 150 })
  farmerName!: string;

  @Column({ type: 'varchar', length: 150 })
  balingCenterName!: string;

  @Column({ type: 'varchar', length: 60 })
  district!: string;

  @Column({
    type: 'enum',
    enum: JuteVariety,
    default: JuteVariety.TOSSA_JUTE,
  })
  variety!: JuteVariety;

  @Column({
    type: 'enum',
    enum: JuteFiberGrade,
    default: JuteFiberGrade.BJC_SPECIAL_TOP,
  })
  grade!: JuteFiberGrade;

  @Column({
    type: 'enum',
    enum: BaleType,
    default: BaleType.KUTCHA_BALE_FARM,
  })
  baleType!: BaleType;

  @Column({ type: 'int', default: 10 })
  baleCount!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 1400.0 })
  grossWeightKg!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 50.0 })
  tareWeightKg!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 1350.0 })
  netRawWeightKg!: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, default: 13.5 })
  moisturePercentage!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0.0 })
  moistureAdjustmentKg!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 1350.0 })
  billableDryWeightKg!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 33.75 })
  billableMaunds!: number; // billableDryWeightKg / 40

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 3900.0 })
  pricePerMaund!: number; // BDT

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 131625.0 })
  totalPayoutBdt!: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, default: 28.5 })
  tensileStrengthGPerTex!: number;

  @Column({ type: 'varchar', length: 50, default: 'Lustrous Golden' })
  lustreScore!: string;

  @Column({ type: 'decimal', precision: 4, scale: 1, default: 2.8 })
  rootCutPercentage!: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, default: 1.2 })
  defectPercentage!: number;

  @Column({
    type: 'enum',
    enum: BalingEscrowStatus,
    default: BalingEscrowStatus.HELD_IN_ESCROW,
  })
  escrowStatus!: BalingEscrowStatus;

  @Column({ type: 'varchar', length: 80, default: 'DOJ-LIC-2026-FRP-44' })
  directorateLicenseNumber!: string;

  @Column({ type: 'varchar', length: 80, default: 'BJRI-QC-CERT-9041' })
  bjriGradeCertNumber!: string;

  @Column({ type: 'boolean', default: true })
  isOrganicCertified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
