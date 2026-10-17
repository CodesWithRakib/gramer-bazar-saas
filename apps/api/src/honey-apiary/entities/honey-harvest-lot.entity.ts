import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  HoneyFloralSource,
  HoneyHarvestType,
  PurityLabGrade,
  BeeSpecies,
} from '../enums/honey-apiary.enum.js';

@Entity('honey_harvest_lots')
export class HoneyHarvestLot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'lot_number', unique: true })
  lotNumber!: string; // e.g. HNY-SUN-2026-0812

  @Column({ name: 'beekeeper_id' })
  beekeeperId!: string;

  @Column({ name: 'beekeeper_name' })
  beekeeperName!: string; // e.g. করিম মৌয়াল দল / সিরাজুল ইসলাম

  @Column({ name: 'beekeeper_phone' })
  beekeeperPhone!: string;

  @Column({ name: 'district' })
  district!: string; // সাতক্ষীরা, সুন্দরবন পশ্চিম রেঞ্জ, টাঙ্গাইল, দিনাজপুর

  @Column({
    type: 'enum',
    enum: HoneyHarvestType,
    name: 'harvest_type',
    default: HoneyHarvestType.WILD_FOREST_MOUWAL_HARVEST,
  })
  harvestType!: HoneyHarvestType;

  @Column({
    type: 'enum',
    enum: HoneyFloralSource,
    name: 'floral_source',
    default: HoneyFloralSource.SUNDARBANS_KHALISHA_WILD,
  })
  floralSource!: HoneyFloralSource;

  @Column({
    type: 'enum',
    enum: BeeSpecies,
    name: 'bee_species',
    default: BeeSpecies.APIS_DORSATA,
  })
  beeSpecies!: BeeSpecies;

  @Column({ name: 'harvest_date', type: 'varchar' })
  harvestDate!: string; // YYYY-MM-DD

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'gross_volume_kg' })
  grossVolumeKg!: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'moisture_percentage' })
  moisturePercentage!: number; // আর্দ্রতা % (আদর্শ < ১৮.৫%)

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'c4_sugar_isotope_ratio_permil' })
  c4SugarIsotopeRatioPermil!: number; // C4 কার্বন আইসোটোপ অনুপাত (<-২৩.৫‰ হলে খাঁটি)

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'hmf_freshness_mg_per_kg' })
  hmfFreshnessMgPerKg!: number; // HMF মানদণ্ড (< ২০ mg/kg তাজা কাঁচা মধু)

  @Column({
    type: 'enum',
    enum: PurityLabGrade,
    name: 'purity_grade',
    default: PurityLabGrade.GRADE_A_RAW_UNPROCESSED,
  })
  purityGrade!: PurityLabGrade;

  @Column({ name: 'lab_certificate_no', nullable: true })
  labCertificateNo!: string | null; // e.g. BCSIR-HNY-2026-901

  @Column({ name: 'forest_dept_permit_no', nullable: true })
  forestDeptPermitNo!: string | null; // সুন্দরবন বন বিভাগের পাশ পারমিট নং

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'wholesale_price_per_kg_bdt' })
  wholesalePricePerKgBdt!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'stock_quantity_kg' })
  stockQuantityKg!: number;

  @Column({ type: 'boolean', name: 'is_forest_certified_wild', default: false })
  isForestCertifiedWild!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
