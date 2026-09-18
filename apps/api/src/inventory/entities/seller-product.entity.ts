import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Shop } from '../../shops/entities/shop.entity.js';
import { ProductVariant } from '../../catalog/entities/product-variant.entity.js';
import { Inventory } from './inventory.entity.js';

@Entity('seller_products')
export class SellerProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'shop_id' })
  shopId: string;

  @ManyToOne(() => Shop, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: Relation<Shop>;

  @Column({ name: 'product_variant_id' })
  productVariantId: string;

  @ManyToOne(() => ProductVariant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: Relation<ProductVariant>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    name: 'discount_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  discountPrice: number | null;

  @Column({ name: 'seller_sku', nullable: true })
  sellerSku: string | null;

  @Column({ name: 'is_regulated_approved', default: false })
  isRegulatedApproved: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToOne(() => Inventory, (inventory) => inventory.sellerProduct, {
    cascade: true,
  })
  inventory: Relation<Inventory>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
