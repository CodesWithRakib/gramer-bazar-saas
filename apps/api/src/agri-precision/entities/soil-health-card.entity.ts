import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { CropTargetNutrient, SoilTextureType } from '../enums/agri-precision.enum.js';

@Entity('soil_health_card_records')
@Index('idx_soil_card_number', ['soilCardNumber'], { unique: true })
@Index('idx_soil_card_farmer', ['farmerId'])
@Index('idx_soil_card_district', ['plotDistrict'])
export class SoilHealthCardRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'soil_card_number', type: 'varchar', length: 50, unique: true })
  soilCardNumber: string; // e.g. SOIL-2026-X901

  @Column({ name: 'farmer_id', type: 'uuid' })
  farmerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farmer_id' })
  farmer: Relation<User>;

  @Column({ name: 'farmer_name', type: 'varchar', length: 150 })
  farmerName: string;

  @Column({ name: 'farmer_phone', type: 'varchar', length: 30 })
  farmerPhone: string;

  @Column({ name: 'plot_address', type: 'text' })
  plotAddress: string;

  @Column({ name: 'plot_district', type: 'varchar', length: 100 })
  plotDistrict: string;

  @Column({ name: 'plot_upazila', type: 'varchar', length: 100 })
  plotUpazila: string;

  @Column({
    name: 'soil_texture',
    type: 'enum',
    enum: SoilTextureType,
    default: SoilTextureType.CLAY_LOAM,
  })
  soilTexture: SoilTextureType;

  @Column({
    name: 'target_crop',
    type: 'enum',
    enum: CropTargetNutrient,
  })
  targetCrop: CropTargetNutrient;

  @Column({ name: 'land_area_bighas', type: 'decimal', precision: 8, scale: 2, default: 1.0 })
  landAreaBighas: number;

  // Diagnostic Test Values
  @Column({ name: 'ph_level', type: 'decimal', precision: 4, scale: 2 })
  phLevel: number; // e.g. 5.8 (acidic)

  @Column({ name: 'nitrogen_kg_per_ha', type: 'decimal', precision: 6, scale: 2 })
  nitrogenKgPerHa: number; // e.g. 140 kg/ha

  @Column({ name: 'phosphorus_ppm', type: 'decimal', precision: 6, scale: 2 })
  phosphorusPpm: number; // e.g. 14.5 ppm

  @Column({ name: 'potassium_meq_per_100g', type: 'decimal', precision: 6, scale: 3 })
  potassiumMeqPer100g: number; // e.g. 0.18 meq/100g

  @Column({ name: 'organic_matter_pct', type: 'decimal', precision: 5, scale: 2 })
  organicMatterPct: number; // e.g. 1.2% (typically low in BD soils)

  @Column({ name: 'zinc_ppm', type: 'decimal', precision: 6, scale: 2, nullable: true })
  zincPpm: number | null;

  @Column({ name: 'boron_ppm', type: 'decimal', precision: 6, scale: 2, nullable: true })
  boronPpm: number | null;

  @Column({ name: 'salinity_ec', type: 'decimal', precision: 5, scale: 2, nullable: true })
  salinityEc: number | null; // dS/m for coastal areas

  // Algorithmic Fertilizer Recommendations per Bigha (33 decimals)
  @Column({ name: 'calculated_urea_kg_per_bigha', type: 'decimal', precision: 6, scale: 2 })
  calculatedUreaKgPerBigha: number;

  @Column({ name: 'calculated_tsp_kg_per_bigha', type: 'decimal', precision: 6, scale: 2 })
  calculatedTspKgPerBigha: number;

  @Column({ name: 'calculated_mop_kg_per_bigha', type: 'decimal', precision: 6, scale: 2 })
  calculatedMopKgPerBigha: number;

  @Column({ name: 'calculated_gypsum_kg_per_bigha', type: 'decimal', precision: 6, scale: 2 })
  calculatedGypsumKgPerBigha: number;

  @Column({ name: 'calculated_zinc_kg_per_bigha', type: 'decimal', precision: 6, scale: 2 })
  calculatedZincKgPerBigha: number;

  @Column({ name: 'calculated_organic_compost_kg_per_bigha', type: 'decimal', precision: 8, scale: 2 })
  calculatedOrganicCompostKgPerBigha: number;

  @Column({ name: 'fertilizer_application_schedule', type: 'text' })
  fertilizerApplicationSchedule: string; // e.g. 1/3 at basal, 1/3 at 20 DAT, 1/3 at panicle

  @Column({ name: 'ph_correction_advice', type: 'text', nullable: true })
  phCorrectionAdvice: string | null; // e.g. Dolomite lime recommendation if pH < 5.5

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
