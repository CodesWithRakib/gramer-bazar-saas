import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SuperfoodProductType } from '../enums/honey-apiary.enum.js';

@Entity('royal_jelly_superfood_batches')
export class RoyalJellySuperfoodBatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'batch_number', unique: true })
  batchNumber!: string; // e.g. RJ-SUPER-2026-99

  @Column({
    type: 'enum',
    enum: SuperfoodProductType,
    name: 'product_type',
    default: SuperfoodProductType.FRESH_FROZEN_ROYAL_JELLY,
  })
  productType!: SuperfoodProductType;

  @Column({ name: 'producer_name' })
  producerName!: string; // সুন্দরবন এপিয়ারি অ্যান্ড রয়্যাল জেলি বায়োটিক

  @Column({ name: 'harvest_location' })
  harvestLocation!: string; // সুন্দরবন মোংলা রেঞ্জ / মাগুরা আধুনিক মৌখামার

  @Column({ type: 'int', name: 'weight_grams', default: 100 })
  weightGrams!: number; // ১০০ গ্রাম, ৫০০ গ্রাম ইত্যাদি

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'ten_hda_percentage', default: 1.8 })
  tenHdaPercentage!: number; // 10-HDA (10-Hydroxy-2-decenoic acid) বায়ো-অ্যাক্টিভ অ্যাসিড (ন্যূনতম ১.৪% - ২.২%)

  @Column({ type: 'decimal', precision: 4, scale: 1, name: 'storage_temperature_celsius', default: -18.0 })
  storageTemperatureCelsius!: number; // -১৮.০°C ডিপ ফ্রিজার

  @Column({ name: 'cold_chain_status', default: 'SUB_ZERO_DEEP_FROZEN_SECURE' })
  coldChainStatus!: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'price_bdt' })
  priceBdt!: number;

  @Column({ type: 'int', name: 'available_stock_count', default: 10 })
  availableStockCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
