import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { WarehouseHub } from './warehouse-hub.entity.js';
import { SellerProduct } from './seller-product.entity.js';

@Entity('hub_stocks')
@Index(['hubId', 'sellerProductId'], { unique: true })
export class HubStock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'hub_id' })
  hubId: string;

  @ManyToOne(() => WarehouseHub, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hub_id' })
  hub: WarehouseHub;

  @Column({ name: 'seller_product_id' })
  sellerProductId: string;

  @ManyToOne(() => SellerProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seller_product_id' })
  sellerProduct: SellerProduct;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ name: 'reserved_quantity', type: 'int', default: 0 })
  reservedQuantity: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batchNumber: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
