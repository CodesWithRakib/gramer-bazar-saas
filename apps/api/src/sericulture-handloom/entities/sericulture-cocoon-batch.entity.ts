import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CocoonType } from '../enums/sericulture-handloom.enum.js';

@Entity('sericulture_cocoon_batches')
export class SericultureCocoonBatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'lot_number', unique: true })
  lotNumber!: string; // e.g., BSDB-LOT-RAJ-2026-01

  @Column({ name: 'farmer_id' })
  farmerId!: string;

  @Column({ name: 'farmer_name' })
  farmerName!: string;

  @Column({ name: 'farming_district' })
  farmingDistrict!: string; // e.g. Bholahat, Shibganj, Natore

  @Column({ name: 'mulberry_variety', default: 'BM-4' })
  mulberryVariety!: string; // BM-4, BM-11

  @Column({
    type: 'enum',
    enum: CocoonType,
    name: 'cocoon_type',
    default: CocoonType.BIVOLTINE,
  })
  cocoonType!: CocoonType;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'fresh_cocoon_weight_kg' })
  freshCocoonWeightKg!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'shell_ratio_percentage', default: 21.5 })
  shellRatioPercentage!: number; // শেল রেশিও (১৮-২৪%)

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'estimated_raw_silk_filament_kg' })
  estimatedRawSilkFilamentKg!: number; // ৮.৫ কেজি গুটি = ১ কেজি র সিল্ক

  @Column({ name: 'reeling_factory_name', nullable: true })
  reelingFactoryName!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'price_per_kg_bdt' })
  pricePerKgBdt!: number; // কাঁচা গুটির কেজি প্রতি সরকারি বা নির্ধারিত দর

  @Column({ type: 'boolean', name: 'is_inspected_by_bsdb', default: true })
  isInspectedByBSDB!: boolean;

  @Column({ name: 'bsdb_inspector_name', nullable: true })
  bsdbInspectorName!: string | null;

  @Column({ name: 'harvest_date', type: 'varchar' })
  harvestDate!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
