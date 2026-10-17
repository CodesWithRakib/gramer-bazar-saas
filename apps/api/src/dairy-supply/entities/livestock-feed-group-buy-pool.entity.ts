import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FeedCategory } from '../enums/dairy-supply.enum.js';

@Entity('livestock_feed_group_buy_pools')
export class LivestockFeedGroupBuyPool {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'pool_code', unique: true })
  poolCode!: string; // e.g. FEED-POOL-BGR-01

  @Column({
    type: 'enum',
    enum: FeedCategory,
    name: 'feed_category',
    default: FeedCategory.MUSTARD_OIL_CAKE,
  })
  feedCategory!: FeedCategory;

  @Column({ name: 'feed_brand_or_mill_name' })
  feedBrandOrMillName!: string; // e.g. স্কয়ার ডেইরি ফিড / এসিআই গোডরেজ / স্থানীয় মাস্টার্ড মিল

  @Column({ type: 'int', name: 'target_volume_kg', default: 5000 })
  targetVolumeKg!: number; // টার্গেট বাল্ক ভলিউম (যেমন ৫ টন)

  @Column({ type: 'int', name: 'committed_volume_kg', default: 0 })
  committedVolumeKg!: number; // বর্তমানে অর্ডারকৃত ভলিউম

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'discounted_price_per_kg_bdt' })
  discountedPricePerKgBdt!: number; // সমবায় ডিসকাউন্টেড রেট

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'retail_market_price_per_kg_bdt' })
  retailMarketPricePerKgBdt!: number; // খুচরা বাজার রেট

  @Column({ type: 'int', name: 'minimum_farmer_participants', default: 5 })
  minimumFarmerParticipants!: number;

  @Column({ type: 'int', name: 'current_participants_count', default: 0 })
  currentParticipantsCount!: number;

  @Column({ name: 'delivery_hub_location' })
  deliveryHubLocation!: string; // e.g. শাহজাদপুর বাঘাবাড়ি ফিড ডিপো

  @Column({ name: 'pool_closing_date', type: 'varchar' })
  poolClosingDate!: string; // YYYY-MM-DD

  @Column({ type: 'boolean', name: 'is_closed_and_ordered', default: false })
  isClosedAndOrdered!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
