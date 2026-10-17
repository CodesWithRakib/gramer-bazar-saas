import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { StayType } from '../enums/agro-tourism.enum.js';
import { AgroExperiencePackage } from './agro-experience-package.entity.js';
import { FarmStayBooking } from './farm-stay-booking.entity.js';

@Entity('farm_stay_listings')
export class FarmStayListing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'host_id' })
  hostId!: string;

  @Column({ name: 'title_en' })
  titleEn!: string;

  @Column({ name: 'title_bn' })
  titleBn!: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: StayType.TRADITIONAL_MUD_HOUSE,
  })
  stayType!: StayType;

  @Column()
  district!: string;

  @Column()
  upazila!: string;

  @Column({ name: 'village_address' })
  villageAddress!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null;

  @Column({ name: 'host_name' })
  hostName!: string;

  @Column({ name: 'host_phone' })
  hostPhone!: string;

  @Column({ name: 'host_nid_verified', default: true })
  hostNidVerified!: boolean;

  @Column({ name: 'max_guests', type: 'int', default: 4 })
  maxGuests!: number;

  @Column({ name: 'bedroom_count', type: 'int', default: 2 })
  bedroomCount!: number;

  @Column({ name: 'bed_count', type: 'int', default: 2 })
  bedCount!: number;

  @Column({ name: 'has_attached_bath', default: true })
  hasAttachedBath!: boolean;

  @Column({ name: 'nightly_rate_bdt', type: 'decimal', precision: 10, scale: 2 })
  nightlyRateBdt!: number;

  @Column({ name: 'weekend_rate_bdt', type: 'decimal', precision: 10, scale: 2 })
  weekendRateBdt!: number;

  @Column({ name: 'all_inclusive_meal_cost_per_person', type: 'decimal', precision: 10, scale: 2, default: 650.0 })
  allInclusiveMealCostPerPerson!: number;

  @Column({ name: 'has_solar_electricity', default: true })
  hasSolarElectricity!: boolean;

  @Column({ name: 'has_pure_tube_well_water', default: true })
  hasPureTubeWellWater!: boolean;

  @Column({ name: 'has_organic_farm_harvest_access', default: true })
  hasOrganicFarmHarvestAccess!: boolean;

  @Column({ name: 'has_clay_stove_cooking', default: true })
  hasClayStoveCooking!: boolean;

  @Column({ name: 'has_traditional_boat_tour', default: false })
  hasTraditionalBoatTour!: boolean;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'simple-array', nullable: true })
  photos!: string[] | null;

  @OneToMany(() => AgroExperiencePackage, (exp) => exp.farmStay)
  experiences!: AgroExperiencePackage[];

  @OneToMany(() => FarmStayBooking, (booking) => booking.farmStay)
  bookings!: FarmStayBooking[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
