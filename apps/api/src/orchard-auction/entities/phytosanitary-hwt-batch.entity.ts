import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  FruitType,
  FruitCultivar,
  HwtTreatmentStatus,
  ChemicalMrlStatus,
} from '../enums/orchard-auction.enum.js';

@Entity('phytosanitary_hwt_batches')
export class PhytosanitaryHwtBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  batchNumber: string;

  @Column({ nullable: true })
  orchardLotId: string;

  @Column()
  orchardName: string;

  @Column({
    type: 'enum',
    enum: FruitType,
    default: FruitType.MANGO,
  })
  fruitType: FruitType;

  @Column({
    type: 'enum',
    enum: FruitCultivar,
    default: FruitCultivar.KHIRSAPAT_HIMSAGAR,
  })
  cultivar: FruitCultivar;

  @Column({ type: 'float', default: 2000 })
  totalFreshWeightKg: number;

  @Column({ type: 'int', default: 100 })
  cratesCount: number;

  @Column({ default: 'Central Packing House, Shyampur, Dhaka' })
  hwtFacilityLocation: string;

  @Column({ type: 'float', default: 48.0 })
  waterTempCelsius: number;

  @Column({ type: 'int', default: 60 })
  immersionDurationMinutes: number;

  @Column({ type: 'float', default: 46.8 })
  fruitCoreTempCelsius: number;

  @Column({ type: 'float', default: 26.0 })
  hydrocoolingTempCelsius: number;

  @Column({
    type: 'enum',
    enum: ChemicalMrlStatus,
    default: ChemicalMrlStatus.TEST_PASSED_MRL_SAFE,
  })
  chemicalMrlStatus: ChemicalMrlStatus;

  @Column({ type: 'float', default: 0.02 })
  pesticideMrlPpm: number;

  @Column({ default: true })
  quarantinePassIssued: boolean;

  @Column({ nullable: true })
  phytosanitaryCertificateNumber: string;

  @Column({ default: 'Dr. Md. Nazmul Huda' })
  inspectorName: string;

  @Column({ default: 'DAE Senior Plant Quarantine Inspector' })
  inspectorDesignation: string;

  @Column({
    type: 'enum',
    enum: HwtTreatmentStatus,
    default: HwtTreatmentStatus.QUARANTINE_CERTIFIED_EXPORT,
  })
  status: HwtTreatmentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
