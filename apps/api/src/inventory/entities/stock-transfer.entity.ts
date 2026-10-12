import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WarehouseHub } from './warehouse-hub.entity.js';
import { SellerProduct } from './seller-product.entity.js';

export enum StockTransferStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

@Entity('stock_transfers')
export class StockTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  transferNumber: string;

  @Column({ name: 'from_hub_id' })
  fromHubId: string;

  @ManyToOne(() => WarehouseHub, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'from_hub_id' })
  fromHub: WarehouseHub;

  @Column({ name: 'to_hub_id' })
  toHubId: string;

  @ManyToOne(() => WarehouseHub, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'to_hub_id' })
  toHub: WarehouseHub;

  @Column({ name: 'seller_product_id' })
  sellerProductId: string;

  @ManyToOne(() => SellerProduct, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seller_product_id' })
  sellerProduct: SellerProduct;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'enum',
    enum: StockTransferStatus,
    default: StockTransferStatus.PENDING,
  })
  status: StockTransferStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'dispatched_at', type: 'timestamp', nullable: true })
  dispatchedAt: Date | null;

  @Column({ name: 'received_at', type: 'timestamp', nullable: true })
  receivedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
