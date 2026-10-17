import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiaryBoxHealthStatus, BeeSpecies } from '../enums/honey-apiary.enum.js';

@Entity('apiary_colony_boxes')
export class ApiaryColonyBox {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'box_code', unique: true })
  boxCode!: string; // e.g. BOX-MELL-TNG-104

  @Column({ name: 'beekeeper_id' })
  beekeeperId!: string;

  @Column({ name: 'beekeeper_name' })
  beekeeperName!: string;

  @Column({
    type: 'enum',
    enum: BeeSpecies,
    name: 'bee_species',
    default: BeeSpecies.APIS_MELLIFERA,
  })
  beeSpecies!: BeeSpecies;

  @Column({ name: 'current_district' })
  currentDistrict!: string; // টাঙ্গাইল, দিনাজপুর, শরীয়তপুর

  @Column({ name: 'current_upazila' })
  currentUpazila!: string; // মির্জাপুর, বোচাগঞ্জ, জাজিরা

  @Column({ type: 'decimal', precision: 10, scale: 6, name: 'gps_latitude' })
  gpsLatitude!: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, name: 'gps_longitude' })
  gpsLongitude!: number;

  @Column({ name: 'active_floral_crop' })
  activeFloralCrop!: string; // সরিষা ফুল ক্ষেত / লিচু বাগান / কালোজিরা

  @Column({ type: 'int', name: 'frames_count', default: 8 })
  framesCount!: number; // ৮-১০ ফ্রেম কলোনি

  @Column({ type: 'int', name: 'queen_age_months', default: 6 })
  queenAgeMonths!: number;

  @Column({
    type: 'enum',
    enum: ApiaryBoxHealthStatus,
    name: 'health_status',
    default: ApiaryBoxHealthStatus.HEALTHY_BROOD_ACTIVE,
  })
  healthStatus!: ApiaryBoxHealthStatus;

  @Column({ type: 'decimal', precision: 6, scale: 2, name: 'estimated_honey_yield_kg', default: 15.0 })
  estimatedHoneyYieldKg!: number;

  @Column({ name: 'last_inspected_at', type: 'varchar' })
  lastInspectedAt!: string; // ISO string

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
