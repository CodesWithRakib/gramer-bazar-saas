import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  MushroomVariety,
  SpawnGenerationStage,
  SubstrateSterilizationStatus,
} from '../enums/mushroom-farming.enum.js';

@Entity('mushroom_spawn_batches')
export class MushroomSpawnBatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  batchNumber!: string;

  @Column({ type: 'varchar', length: 150 })
  labName!: string;

  @Column({ type: 'varchar', length: 30 })
  growerPhone!: string;

  @Column({ type: 'varchar', length: 60 })
  district!: string;

  @Column({
    type: 'enum',
    enum: MushroomVariety,
    default: MushroomVariety.OYSTER_WHITE_PO2,
  })
  variety!: MushroomVariety;

  @Column({
    type: 'enum',
    enum: SpawnGenerationStage,
    default: SpawnGenerationStage.COMMERCIAL_SAWDUST_CYLINDER,
  })
  generationStage!: SpawnGenerationStage;

  @Column({ type: 'date' })
  inoculationDate!: string;

  @Column({ type: 'int', default: 500 })
  packetsCount!: number;

  @Column({
    type: 'enum',
    enum: SubstrateSterilizationStatus,
    default: SubstrateSterilizationStatus.AUTOCLAVE_PRESSURE_STERILIZED,
  })
  sterilizationMethod!: SubstrateSterilizationStatus;

  @Column({ type: 'decimal', precision: 5, scale: 1, default: 121.0 })
  autoclaveTempCelsius!: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, default: 15.0 })
  autoclavePressurePsi!: number;

  @Column({ type: 'varchar', length: 80, nullable: true })
  nmdiLabCertificationNo!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 45.0 })
  pricePerPacketBdt!: number;

  @Column({ type: 'boolean', default: true })
  isContaminationFreeCertified!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
