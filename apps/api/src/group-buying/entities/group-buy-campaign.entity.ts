import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { SellerProduct } from '../../inventory/entities/seller-product.entity.js';
import { GroupBuyCampaignStatus } from '../enums/group-buying.enum.js';
import { GroupBuyPool } from './group-buy-pool.entity.js';

export interface TierPricing {
  minQty: number;
  price: number;
}

@Entity('group_buy_campaigns')
export class GroupBuyCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title_en', type: 'varchar', length: 255 })
  titleEn: string;

  @Column({ name: 'title_bn', type: 'varchar', length: 255 })
  titleBn: string;

  @Column({ name: 'seller_product_id', type: 'uuid' })
  sellerProductId: string;

  @ManyToOne(() => SellerProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seller_product_id' })
  sellerProduct: SellerProduct;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId: string;

  @Column({ name: 'regular_price', type: 'decimal', precision: 12, scale: 2 })
  regularPrice: number;

  @Column({ name: 'group_price', type: 'decimal', precision: 12, scale: 2 })
  groupPrice: number;

  @Column({ name: 'min_participants', type: 'int', default: 5 })
  minParticipants: number;

  @Column({ name: 'max_participants', type: 'int', nullable: true })
  maxParticipants?: number | null;

  @Column({ name: 'duration_hours', type: 'int', default: 48 })
  durationHours: number;

  @Column({ name: 'tiered_pricing', type: 'jsonb', nullable: true })
  tieredPricing?: TierPricing[] | null;

  @Column({ name: 'target_district', type: 'varchar', length: 100, nullable: true })
  targetDistrict?: string | null;

  @Column({ name: 'target_upazila', type: 'varchar', length: 100, nullable: true })
  targetUpazila?: string | null;

  @Column({ name: 'drop_point_name', type: 'varchar', length: 255 })
  dropPointName: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: GroupBuyCampaignStatus.ACTIVE,
  })
  status: GroupBuyCampaignStatus;

  @Column({ name: 'start_date', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp with time zone', nullable: true })
  endDate?: Date | null;

  @OneToMany(() => GroupBuyPool, (pool) => pool.campaign)
  pools: GroupBuyPool[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
