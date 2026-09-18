import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { SellerProduct } from './seller-product.entity.js';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'seller_product_id' })
  sellerProductId: string;

  @OneToOne(() => SellerProduct, (sellerProduct) => sellerProduct.inventory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seller_product_id' })
  sellerProduct: Relation<SellerProduct>;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ name: 'reserved_quantity', type: 'int', default: 0 })
  reservedQuantity: number;

  @Column({ name: 'low_stock_threshold', type: 'int', default: 5 })
  lowStockThreshold: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
