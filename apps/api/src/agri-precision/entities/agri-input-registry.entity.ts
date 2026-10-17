import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { InputCategory, InputVerificationStatus } from '../enums/agri-precision.enum.js';

@Entity('agri_input_registry')
@Index('idx_input_code', ['barcodeOrQrCode'], { unique: true })
@Index('idx_input_batch', ['batchNumber'])
@Index('idx_input_category', ['category'])
@Index('idx_input_status', ['status'])
export class AgriInputRegistryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'barcode_or_qr_code', type: 'varchar', length: 100, unique: true })
  barcodeOrQrCode: string; // e.g. CHEM-SYN-2026-X812 or 890123456789

  @Column({ name: 'batch_number', type: 'varchar', length: 100 })
  batchNumber: string; // e.g. B-2026-09A

  @Column({ name: 'brand_name', type: 'varchar', length: 200 })
  brandName: string; // e.g. Virtako 40WG, Amistar Top 325 SC, Granular Urea

  @Column({ name: 'manufacturer_name', type: 'varchar', length: 200 })
  manufacturerName: string; // e.g. Syngenta Bangladesh Ltd., BCIC, Bayer CropScience

  @Column({
    type: 'enum',
    enum: InputCategory,
  })
  category: InputCategory;

  @Column({ name: 'active_ingredients', type: 'varchar', length: 255 })
  activeIngredients: string; // e.g. Chlorantraniliprole 20% + Thiamethoxam 20%

  @Column({ name: 'standard_purity_pct', type: 'decimal', precision: 5, scale: 2, default: 99.0 })
  standardPurityPct: number;

  @Column({ name: 'dae_registration_no', type: 'varchar', length: 100 })
  daeRegistrationNo: string; // Department of Agricultural Extension License (e.g. DAE-AP-4891)

  @Column({ name: 'manufacture_date', type: 'date' })
  manufactureDate: Date;

  @Column({ name: 'expiry_date', type: 'date' })
  expiryDate: Date;

  @Column({
    type: 'enum',
    enum: InputVerificationStatus,
    default: InputVerificationStatus.AUTHENTIC_CERTIFIED,
  })
  status: InputVerificationStatus;

  @Column({ name: 'mrp_price_bdt', type: 'decimal', precision: 10, scale: 2 })
  mrpPriceBdt: number; // Official Maximum Retail Price (prevents black-market price gouging)

  @Column({ name: 'standard_dosage_guide', type: 'text' })
  standardDosageGuide: string; // e.g. 1.5g per 10L water for potato late blight

  @Column({ name: 'counterfeit_reports_count', type: 'int', default: 0 })
  counterfeitReportsCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
