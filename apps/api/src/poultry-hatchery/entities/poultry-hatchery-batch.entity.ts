import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  PoultryBreedType,
  HatcheryFlockStage,
  VaccinationStatus,
} from '../enums/poultry-hatchery.enum.js';

@Entity('poultry_hatchery_batches')
export class PoultryHatcheryBatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'batch_code', unique: true })
  batchCode!: string; // e.g. DOC-SON-GAZ-2026-091

  @Column({ name: 'hatchery_name' })
  hatcheryName!: string; // গাজীপুর সেন্ট্রাল সোনালী হ্যাচারি

  @Column({ name: 'breeder_phone' })
  breederPhone!: string;

  @Column({ name: 'district' })
  district!: string; // গাজীপুর, বগুড়া, নরসিংদী, কিশোরগঞ্জ, ময়মনসিংহ

  @Column({
    type: 'enum',
    enum: PoultryBreedType,
    name: 'breed_type',
    default: PoultryBreedType.SONALI_CLASSIC,
  })
  breedType!: PoultryBreedType;

  @Column({
    type: 'enum',
    enum: HatcheryFlockStage,
    name: 'flock_stage',
    default: HatcheryFlockStage.DAY_OLD_CHICK_DOC,
  })
  flockStage!: HatcheryFlockStage;

  @Column({ name: 'hatch_date', type: 'varchar' })
  hatchDate!: string; // YYYY-MM-DD

  @Column({ type: 'int', name: 'chick_count', default: 2000 })
  chickCount!: number; // ব্যাচে বাচ্চার সংখ্যা

  @Column({ type: 'decimal', precision: 6, scale: 2, name: 'average_weight_grams', default: 42.0 })
  averageWeightGrams!: number; // গড়ে ওজন (গ্রাম)

  @Column({
    type: 'enum',
    enum: VaccinationStatus,
    name: 'vaccination_status',
    default: VaccinationStatus.MAREKS_DAY_1_CERTIFIED,
  })
  vaccinationStatus!: VaccinationStatus;

  @Column({ name: 'dls_surgeon_certification_no', nullable: true })
  dlsSurgeonCertificationNo!: string | null; // উপজেলা প্রাণিসম্পদ কর্মকর্তার ভ্যাক্সিনেশন সনদ

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'unit_price_bdt' })
  unitPriceBdt!: number; // প্রতি বাচ্চা বা কেজি দর

  @Column({ type: 'int', name: 'mortality_count', default: 0 })
  mortalityCount!: number; // মৃত্যুর সংখ্যা

  @Column({ type: 'boolean', name: 'is_biosecure_certified', default: true })
  isBiosecureCertified!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
