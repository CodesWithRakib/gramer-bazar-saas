import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  SpiceType,
  SpiceRegion,
  DryingMethod,
  DryingBatchStatus,
  AflatoxinRiskLevel,
} from '../enums/spice-market.enum.js';

@Entity('spice_drying_batches')
export class SpiceDryingBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  batchNumber: string;

  @Column()
  growerCoopName: string;

  @Column()
  contactPhone: string;

  @Column({
    type: 'enum',
    enum: SpiceRegion,
    default: SpiceRegion.BOGURA_SARIAKANDI_CHAR,
  })
  region: SpiceRegion;

  @Column({
    type: 'enum',
    enum: SpiceType,
    default: SpiceType.CHILLI,
  })
  spiceType: SpiceType;

  @Column({ default: 'BARI Morich-2 (বগুড়ার লাল মরিচ)' })
  varietyName: string;

  @Column({ type: 'float', default: 2000 })
  initialFreshWeightKg: number;

  @Column({ type: 'float', default: 450 })
  currentDryWeightKg: number;

  @Column({
    type: 'enum',
    enum: DryingMethod,
    default: DryingMethod.SOLAR_PARABOLIC_TUNNEL,
  })
  dryingMethod: DryingMethod;

  @Column({ type: 'float', default: 49.5 })
  chamberTempCelsius: number;

  @Column({ type: 'float', default: 38.0 })
  chamberHumidityPct: number;

  @Column({ type: 'float', default: 9.2 })
  currentMoisturePct: number;

  @Column({ type: 'int', default: 4 })
  dryingDaysElapsed: number;

  @Column({
    type: 'enum',
    enum: AflatoxinRiskLevel,
    default: AflatoxinRiskLevel.SAFE_ZERO_RISK,
  })
  aflatoxinRiskLevel: AflatoxinRiskLevel;

  @Column({
    type: 'enum',
    enum: DryingBatchStatus,
    default: DryingBatchStatus.DEHYDRATION_COMPLETED,
  })
  status: DryingBatchStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
