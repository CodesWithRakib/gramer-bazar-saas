import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  SericultureCraftType,
  ArtisanOrderEscrowStatus,
} from '../enums/sericulture-handloom.enum.js';

@Entity('artisan_custom_orders')
export class ArtisanCustomOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'order_number', unique: true })
  orderNumber!: string; // e.g. HND-ORD-2026-0812

  @Column({ name: 'buyer_id' })
  buyerId!: string;

  @Column({ name: 'buyer_name' })
  buyerName!: string;

  @Column({ name: 'buyer_phone' })
  buyerPhone!: string;

  @Column({ name: 'buyer_email', nullable: true })
  buyerEmail!: string | null;

  @Column({ name: 'artisan_id' })
  artisanId!: string;

  @Column({ name: 'artisan_name' })
  artisanName!: string;

  @Column({
    type: 'enum',
    enum: SericultureCraftType,
    name: 'craft_type',
  })
  craftType!: SericultureCraftType;

  @Column({ name: 'custom_motif_description', type: 'text' })
  customMotifDescription!: string; // বুটা, পাড় ও আঁচলের নকশা ও বিশেষ অনুরোধ

  @Column({ name: 'primary_color_hex', default: '#800020' })
  primaryColorHex!: string; // কালার প্যালেট

  @Column({ name: 'zari_specification', default: 'PURE_SILVER_ZARI' })
  zariSpecification!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'agreed_price_bdt' })
  agreedPriceBdt!: number; // মোট চুক্তিমূল্য

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'advance_escrow_bdt' })
  advanceEscrowBdt!: number; // ৫০% অগ্রিম জামানত এসক্রোতে জমা

  @Column({ type: 'int', name: 'estimated_delivery_days', default: 21 })
  estimatedDeliveryDays!: number;

  @Column({
    type: 'enum',
    enum: ArtisanOrderEscrowStatus,
    name: 'order_status',
    default: ArtisanOrderEscrowStatus.ORDER_PLACED_ESCROW_LOCKED,
  })
  orderStatus!: ArtisanOrderEscrowStatus;

  @Column({ type: 'int', name: 'weft_progress_percentage', default: 10 })
  weftProgressPercentage!: number; // বুনন অগ্রগতি শতাংশ (০-১০০%)

  @Column({ name: 'inspection_notes', type: 'text', nullable: true })
  inspectionNotes!: string | null;

  @Column({ name: 'dispatched_tracking_number', nullable: true })
  dispatchedTrackingNumber!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
