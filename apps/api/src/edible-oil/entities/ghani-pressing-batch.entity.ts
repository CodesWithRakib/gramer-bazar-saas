import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  OilSeedType,
  OilExtractionMethod,
  GhaniWoodType,
  PressingBatchStatus,
  OilRegion,
} from '../enums/edible-oil.enum.js';

@Entity('ghani_pressing_batches')
export class GhaniPressingBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  batchNumber: string;

  @Column()
  millName: string;

  @Column()
  contactPhone: string;

  @Column({
    type: 'enum',
    enum: OilRegion,
    default: OilRegion.TANGAIL_DELDUAR,
  })
  region: OilRegion;

  @Column({
    type: 'enum',
    enum: OilSeedType,
    default: OilSeedType.MUSTARD_MAGHI_DESHI,
  })
  seedType: OilSeedType;

  @Column({ default: 'Deshi Maghi Red/Brown Seed (ছোট লাল মাঘী সরিষা)' })
  seedVariety: string;

  @Column({ type: 'float', default: 500 })
  inputSeedWeightKg: number;

  @Column({ type: 'float', default: 175 })
  extractedOilLiters: number;

  @Column({ type: 'float', default: 310 })
  oilcakeWeightKg: number;

  @Column({ type: 'float', default: 35.0 })
  extractionYieldPct: number;

  @Column({
    type: 'enum',
    enum: OilExtractionMethod,
    default: OilExtractionMethod.WOOD_GHANI_COLD_PRESS,
  })
  extractionMethod: OilExtractionMethod;

  @Column({
    type: 'enum',
    enum: GhaniWoodType,
    default: GhaniWoodType.TAMARIND_WOOD,
  })
  ghaniWoodType: GhaniWoodType;

  @Column({ type: 'float', default: 36.5 })
  maxExtractionTempCelsius: number;

  @Column({ type: 'float', default: 16.0 })
  operatingRpm: number;

  @Column({ type: 'float', default: 6.5 })
  crushingHours: number;

  @Column({
    type: 'enum',
    enum: PressingBatchStatus,
    default: PressingBatchStatus.DECANTING_SETTLING,
  })
  status: PressingBatchStatus;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
