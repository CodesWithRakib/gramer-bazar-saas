import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EggQualityGrade } from '../enums/poultry-hatchery.enum.js';

@Entity('table_egg_grading_lots')
export class TableEggGradingLot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'lot_number', unique: true })
  lotNumber!: string; // e.g. EGG-LYR-2026-8801

  @Column({ name: 'farm_name' })
  farmName!: string; // নরসিংদী লেয়ার এগ্রো ফার্ম

  @Column({ name: 'district' })
  district!: string; // নরসিংদী, কিশোরগঞ্জ, গাজীপুর

  @Column({ name: 'collection_date', type: 'varchar' })
  collectionDate!: string; // YYYY-MM-DD

  @Column({ type: 'int', name: 'total_eggs_count', default: 5000 })
  totalEggsCount!: number; // সংগৃহীত ডিমের সংখ্যা

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'average_egg_weight_grams', default: 61.5 })
  averageEggWeightGrams!: number; // গড়ে ডিমের ওজন (গ্রাম)

  @Column({
    type: 'enum',
    enum: EggQualityGrade,
    name: 'egg_grade',
    default: EggQualityGrade.GRADE_A_LARGE_58_64G,
  })
  eggGrade!: EggQualityGrade;

  @Column({ type: 'boolean', name: 'uv_sanitization_verified', default: true })
  uvSanitizationVerified!: boolean; // আল্ট্রা-ভায়োলেট স্যানিটাইজেশন

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'cracked_egg_percentage', default: 0.8 })
  crackedEggPercentage!: number; // ফাটা বা অপচয় শতকরা হার (< ১.৫%)

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'price_per_hundred_bdt', default: 1150 })
  pricePerHundredBdt!: number; // প্রতি ১০০ ডিমের পাইকারি দর (যেমন ১১৫০ টাকা)

  @Column({ type: 'int', name: 'available_cases_count', default: 20 })
  availableCasesCount!: number; // ১ কেইস = ৩৬০টি ডিম (১২ হালি ট্রে)

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
