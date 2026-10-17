import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  GurType,
  GurRegion,
  SapCollectionShift,
  BoilingPanType,
} from '../enums/artisanal-gur.enum.js';

@Entity('date_palm_tapping_batches')
export class DatePalmTappingBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  batchNumber: string;

  @Column()
  gachhiCoopName: string;

  @Column()
  contactPhone: string;

  @Column({
    type: 'enum',
    enum: GurRegion,
    default: GurRegion.JASHORE_JHIKARGACHA,
  })
  region: GurRegion;

  @Column({
    type: 'enum',
    enum: GurType,
    default: GurType.DATE_PALM_NOLEN_JHOLA,
  })
  gurType: GurType;

  @Column({
    type: 'enum',
    enum: SapCollectionShift,
    default: SapCollectionShift.DAWN_JIRAN_PREMIUM,
  })
  sapCollectionShift: SapCollectionShift;

  @Column({ type: 'int', default: 85 })
  treesTappedCount: number;

  @Column({ type: 'float', default: 450 })
  rawSapVolumeLiters: number;

  @Column({ type: 'float', default: 13.5 })
  sapBrixDegrees: number; // Raw sap sugar content (11-15° Brix)

  @Column({ type: 'float', default: 115.5 })
  strikeBoilingTempCelsius: number; // Peak striking temp (114-116°C for Jhola, 118-120°C for Patali)

  @Column({
    type: 'enum',
    enum: BoilingPanType,
    default: BoilingPanType.TRADITIONAL_IRON_KARAI,
  })
  panType: BoilingPanType;

  @Column({ type: 'float', default: 52.5 })
  producedGurWeightKg: number;

  @Column({ type: 'float', default: 8.57 })
  sapToGurRatio: number; // Liters of sap per 1 kg of pure gur (e.g. 8.5 : 1)

  @Column({ default: 'BOILING_COMPLETED' })
  status: string;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
