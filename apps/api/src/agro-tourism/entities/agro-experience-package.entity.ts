import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExperienceCategory } from '../enums/agro-tourism.enum.js';
import { FarmStayListing } from './farm-stay-listing.entity.js';

@Entity('agro_experience_packages')
export class AgroExperiencePackage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'farm_stay_id' })
  farmStayId!: string;

  @Column({ name: 'title_en' })
  titleEn!: string;

  @Column({ name: 'title_bn' })
  titleBn!: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: ExperienceCategory.FRUIT_HARVEST_TASTING,
  })
  category!: ExperienceCategory;

  @Column({ name: 'duration_hours', type: 'decimal', precision: 4, scale: 1, default: 3.5 })
  durationHours!: number;

  @Column({ name: 'price_per_person_bdt', type: 'decimal', precision: 10, scale: 2 })
  pricePerPersonBdt!: number;

  @Column({ name: 'min_participants', type: 'int', default: 2 })
  minParticipants!: number;

  @Column({ name: 'max_participants', type: 'int', default: 12 })
  maxParticipants!: number;

  @Column({ name: 'includes_safety_gear', default: true })
  includesSafetyGear!: boolean;

  @Column({ name: 'includes_farm_refreshment', default: true }) // ডাবের পানি, মুড়ি, খামারের গুড়
  includesFarmRefreshment!: boolean;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @ManyToOne(() => FarmStayListing, (stay) => stay.experiences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_stay_id' })
  farmStay!: FarmStayListing;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
