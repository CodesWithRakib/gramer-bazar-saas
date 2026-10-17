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
  RettingMethod,
  RettingStatus,
} from '../enums/jute-biotech.enum.js';

@Entity('jute_retting_batches')
export class JuteRettingBatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  batchCode!: string;

  @Column({ type: 'varchar', length: 150 })
  farmerName!: string;

  @Column({ type: 'varchar', length: 30 })
  farmerPhone!: string;

  @Column({ type: 'varchar', length: 60 })
  district!: string;

  @Column({ type: 'varchar', length: 60 })
  upazila!: string;

  @Column({ type: 'varchar', length: 60, default: 'Flowing River Canal' })
  waterSourceType!: string;

  @Column({
    type: 'enum',
    enum: JuteVariety,
    default: JuteVariety.TOSSA_JUTE,
  })
  variety!: JuteVariety;

  @Column({
    type: 'enum',
    enum: RettingMethod,
    default: RettingMethod.RIBBON_RETTING_ENZYMATIC,
  })
  rettingMethod!: RettingMethod;

  @Column({ type: 'boolean', default: true })
  microbialInoculantUsed!: boolean;

  @Column({ type: 'varchar', length: 80, default: 'BJRI-PectinoConsortium-B4' })
  inoculantStrainCode!: string;

  @Column({ type: 'date' })
  steepingDate!: string;

  @Column({ type: 'date' })
  expectedHarvestDate!: string;

  @Column({ type: 'int', default: 1 })
  daysElapsed!: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, default: 30.5 })
  waterTempCelsius!: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 7.1 })
  waterPh!: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 4.2 })
  dissolvedOxygenMgL!: number;

  @Column({
    type: 'enum',
    enum: RettingStatus,
    default: RettingStatus.STEEPING_INITIATED,
  })
  status!: RettingStatus;

  @Column({ type: 'decimal', precision: 6, scale: 1, default: 45.0 })
  targetFiberYieldMaunds!: number;

  @Column({ type: 'varchar', length: 100, default: 'Dr. Rafiqul Islam, BJRI Scientific Officer' })
  bjriFieldOfficer!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
