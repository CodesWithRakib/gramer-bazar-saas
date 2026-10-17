import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  MilkType,
  MilkShift,
  MilkQualityGrade,
  PaymentSettlementStatus,
} from '../enums/dairy-supply.enum.js';

@Entity('dairy_milk_collection_entries')
export class DairyMilkCollectionEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'collection_voucher_no', unique: true })
  collectionVoucherNo!: string; // e.g. MLK-BAG-2026-0819

  @Column({ name: 'farmer_id' })
  farmerId!: string;

  @Column({ name: 'farmer_name' })
  farmerName!: string;

  @Column({ name: 'farmer_phone' })
  farmerPhone!: string;

  @Column({ name: 'cooperative_center_id' })
  cooperativeCenterId!: string; // e.g. baghabari-hub-01

  @Column({ name: 'cooperative_name' })
  cooperativeName!: string; // e.g. বাঘাবাড়ি দুগ্ধ সমবায় সমিতি

  @Column({
    type: 'enum',
    enum: MilkType,
    name: 'milk_type',
    default: MilkType.COW_MILK,
  })
  milkType!: MilkType;

  @Column({
    type: 'enum',
    enum: MilkShift,
    name: 'collection_shift',
    default: MilkShift.MORNING_SHIFT,
  })
  collectionShift!: MilkShift;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'volume_liters' })
  volumeLiters!: number; // সংগৃহীত দুধের পরিমাণ (লিটার)

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'lactometer_reading_corrected' })
  lactometerReadingCorrected!: number; // কারেক্টেড ল্যাকটোমিটার রিডিং (CLR) সাধারণত ২৭-৩২

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'fat_percentage' })
  fatPercentage!: number; // দুধের ফ্যাট শতাংশ (৩.৫ - ৮.০%)

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'snf_percentage' })
  snfPercentage!: number; // Solid-Not-Fat (SNF) = (CLR/4) + (0.2 * Fat) + 0.36

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'mbrt_hours', default: 4.5 })
  mbrtHours!: number; // Methylene Blue Reduction Test টাটকা সতেজতা (ঘণ্টা)

  @Column({
    type: 'enum',
    enum: MilkQualityGrade,
    name: 'quality_grade',
    default: MilkQualityGrade.GRADE_A_PREMIUM_CHILLED,
  })
  qualityGrade!: MilkQualityGrade;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'rate_per_liter_bdt' })
  ratePerLiterBdt!: number; // ফ্যাট ও এসএনএফ সমন্বিত চূড়ান্ত লিটার প্রতি দর

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_payout_amount_bdt' })
  totalPayoutAmountBdt!: number; // মোট পাওনা টাকা

  @Column({
    type: 'enum',
    enum: PaymentSettlementStatus,
    name: 'payment_status',
    default: PaymentSettlementStatus.PAYMENT_PENDING,
  })
  paymentStatus!: PaymentSettlementStatus;

  @Column({ name: 'collection_date', type: 'varchar' })
  collectionDate!: string; // YYYY-MM-DD

  @Column({ name: 'adulteration_notes', type: 'text', nullable: true })
  adulterationNotes!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
