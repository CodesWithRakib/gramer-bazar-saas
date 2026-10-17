import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  TeaGardenRegion,
  PluckingStandard,
} from '../enums/tea-estate.enum.js';

@Entity('tea_green_leaf_intakes')
export class TeaGreenLeafIntake {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  intakeTicketNumber!: string;

  @Column({ type: 'varchar', length: 150 })
  smallholderFarmerName!: string;

  @Column({ type: 'varchar', length: 30 })
  farmerPhone!: string;

  @Column({ type: 'varchar', length: 80, default: 'BTB-SHT-2026-PCH-551' })
  farmerRegNumber!: string;

  @Column({ type: 'varchar', length: 150 })
  gardenNameOrCluster!: string;

  @Column({
    type: 'enum',
    enum: TeaGardenRegion,
    default: TeaGardenRegion.PANCHAGARH_TERAI_FLATLAND,
  })
  region!: TeaGardenRegion;

  @Column({ type: 'date' })
  pluckingDate!: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 180.0 })
  grossWeightKg!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 5.0 })
  tareBagWeightKg!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 175.0 })
  netRawWeightKg!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 88.0 })
  finePluckingPercentage!: number; // % of "two leaves and a bud"

  @Column({
    type: 'enum',
    enum: PluckingStandard,
    default: PluckingStandard.SUPERFINE_TWO_LEAVES_AND_BUD,
  })
  pluckingStandard!: PluckingStandard;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 3.5 })
  surfaceWaterMoistureDeductionKg!: number; // surface rain/dew water deduction

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0.0 })
  coarseLeafDeductionKg!: number; // overgrown 3rd/4th leaf deduction

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 171.5 })
  netBillableLeafWeightKg!: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 34.0 })
  ratePerKgBdt!: number; // BTB benchmark smallholder price

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 6122.55 })
  totalPayoutBdt!: number;

  @Column({ type: 'varchar', length: 100, default: 'Md. Shahidul Islam, BTB Tea Extension Officer' })
  btbInspectorName!: string;

  @Column({ type: 'varchar', length: 50, default: 'PAID_VIA_BKASH' })
  payoutStatus!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
