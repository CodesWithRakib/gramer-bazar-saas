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
  TeaProcessingType,
  TeaLeafGrade,
} from '../enums/tea-estate.enum.js';

@Entity('tea_factory_batches')
export class TeaFactoryBatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  batchNumber!: string;

  @Column({ type: 'varchar', length: 150 })
  factoryName!: string;

  @Column({
    type: 'enum',
    enum: TeaGardenRegion,
    default: TeaGardenRegion.SREEMANGAL_MOULVIBAZAR,
  })
  region!: TeaGardenRegion;

  @Column({
    type: 'enum',
    enum: TeaProcessingType,
    default: TeaProcessingType.CTC_BLACK_TEA,
  })
  processingType!: TeaProcessingType;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 4000.0 })
  greenLeafIntakeKg!: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, default: 14.5 })
  witheringTroughHours!: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, default: 11.2 })
  witheringMoistureLossPercentage!: number; // percentage of weight loss in trough

  @Column({ type: 'decimal', precision: 4, scale: 1, default: 28.5 })
  rollingFrictionTempCelsius!: number; // kept <32°C

  @Column({ type: 'int', default: 75 })
  fermentationTimeMinutes!: number; // oxidation time

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 2.8 })
  dryerDischargeMoisturePercentage!: number; // finished moisture target <3.0%

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 920.0 })
  finishedTeaYieldKg!: number;

  @Column({
    type: 'enum',
    enum: TeaLeafGrade,
    default: TeaLeafGrade.BOP,
  })
  primaryGrade!: TeaLeafGrade;

  @Column({ type: 'varchar', length: 100, default: 'BTB-ESTATE-GRADE-A1' })
  certificationMark!: string;

  @Column({ type: 'boolean', default: true })
  isOrganicCertified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
