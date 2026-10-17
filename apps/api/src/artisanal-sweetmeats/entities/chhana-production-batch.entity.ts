import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  SweetmeatType,
  SweetmeatRegion,
  MilkSourceType,
  ChhanaCoagulantType,
} from '../enums/artisanal-sweetmeats.enum.js';

@Entity('chhana_production_batches')
export class ChhanaProductionBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  batchNumber: string;

  @Column()
  moiraGuildName: string;

  @Column()
  contactPhone: string;

  @Column({
    type: 'enum',
    enum: SweetmeatRegion,
    default: SweetmeatRegion.BOGURA_SADAR,
  })
  region: SweetmeatRegion;

  @Column({
    type: 'enum',
    enum: SweetmeatType,
    default: SweetmeatType.BOGURA_SPECIAL_CURD_DOI,
  })
  sweetmeatType: SweetmeatType;

  @Column({
    type: 'enum',
    enum: MilkSourceType,
    default: MilkSourceType.INDIGENOUS_COW_DESHI,
  })
  milkSource: MilkSourceType;

  @Column({ type: 'float', default: 250 })
  inputMilkVolumeLiters: number;

  @Column({ type: 'float', default: 4.8 })
  milkFatPct: number;

  @Column({ type: 'float', default: 8.7 })
  milkSnfPct: number;

  @Column({
    type: 'enum',
    enum: ChhanaCoagulantType,
    default: ChhanaCoagulantType.NATURAL_WHEY_CULTURE,
  })
  coagulantType: ChhanaCoagulantType;

  @Column({ type: 'float', default: 83.5 })
  coagulationTempCelsius: number; // 82-85°C optimal curdling

  @Column({ type: 'float', default: 42.0 })
  producedChhanaKg: number;

  @Column({ type: 'float', default: 52.0 })
  chhanaMoisturePct: number; // 50-55% optimal moisture

  @Column({ default: 'CURDLING_IN_PROGRESS' })
  status: string;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
