import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  SericultureCraftType,
  SilkGrade,
  YarnMaterial,
  AuthenticityStatus,
  WeavingLoomType,
} from '../enums/sericulture-handloom.enum.js';

@Entity('handloom_artisan_products')
export class HandloomArtisanProduct {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'artisan_id' })
  artisanId!: string;

  @Column({ name: 'artisan_name' })
  artisanName!: string;

  @Column({
    type: 'enum',
    enum: SericultureCraftType,
    name: 'craft_type',
  })
  craftType!: SericultureCraftType;

  @Column({ name: 'title_bn' })
  titleBn!: string;

  @Column({ name: 'title_en' })
  titleEn!: string;

  @Column({ name: 'origin_district' })
  originDistrict!: string; // e.g., Rajshahi, Tangail, Narayanganj, Rangamati

  @Column({ name: 'weaving_village' })
  weavingVillage!: string; // e.g., Sopura, Pathrail, Rupganj, Bholahat

  @Column({
    type: 'enum',
    enum: WeavingLoomType,
    name: 'loom_type',
    default: WeavingLoomType.TRADITIONAL_PIT_LOOM,
  })
  loomType!: WeavingLoomType;

  @Column({
    type: 'enum',
    enum: YarnMaterial,
    name: 'yarn_material',
    default: YarnMaterial.PURE_MULBERRY_SILK_100,
  })
  yarnMaterial!: YarnMaterial;

  @Column({ type: 'int', name: 'thread_count_warp', default: 100 })
  threadCountWarp!: number; // টানা সুতার কাউন্ট

  @Column({ type: 'int', name: 'thread_count_weft', default: 100 })
  threadCountWeft!: number; // পোড়েন সুতার কাউন্ট

  @Column({
    type: 'enum',
    enum: SilkGrade,
    name: 'silk_grade',
    default: SilkGrade.GRADE_A_PREMIUM_EXPORT,
  })
  silkGrade!: SilkGrade;

  @Column({
    type: 'enum',
    enum: AuthenticityStatus,
    name: 'authenticity_status',
    default: AuthenticityStatus.BSDB_BHB_CERTIFIED,
  })
  authenticityStatus!: AuthenticityStatus;

  @Column({ name: 'gi_certificate_number', type: 'varchar', nullable: true })
  giCertificateNumber!: string | null; // GI-BD-SILK-001 or GI-BD-JAMDANI-002

  @Column({ type: 'int', name: 'weaving_duration_days', default: 7 })
  weavingDurationDays!: number; // কারিগরের মোট বুনন সময়কাল (দিন)

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'artisan_wage_bdt' })
  artisanWageBdt!: number; // কারিগরের সরাসরি ন্যায্য পারিশ্রমিক (টাকা)

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'price_bdt' })
  priceBdt!: number; // চূড়ান্ত বিক্রয়মূল্য

  @Column({ type: 'int', name: 'stock_quantity', default: 1 })
  stockQuantity!: number;

  @Column({ type: 'simple-array', name: 'media_gallery_urls', nullable: true })
  mediaGalleryUrls!: string[];

  @Column({ name: 'burn_test_result_notes', type: 'text', nullable: true })
  burnTestResultNotes!: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'dimensions_length_meters', default: 5.5 })
  dimensionsLengthMeters!: number; // শাড়ি বা চাদরের দৈর্ঘ্য

  @Column({ type: 'int', name: 'dimensions_width_inches', default: 46 })
  dimensionsWidthInches!: number; // বহর (ইঞ্চি)

  @Column({ type: 'boolean', name: 'is_custom_order_available', default: true })
  isCustomOrderAvailable!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
