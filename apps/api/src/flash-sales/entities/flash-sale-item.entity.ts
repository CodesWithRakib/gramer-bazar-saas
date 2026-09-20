import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FlashSale } from './flash-sale.entity.js';
import { SellerProduct } from '../../inventory/entities/seller-product.entity.js';

@Entity('flash_sale_items')
export class FlashSaleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  flashSaleId: string;

  @ManyToOne(() => FlashSale, (flashSale) => flashSale.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flashSaleId' })
  flashSale: FlashSale;

  @Column()
  sellerProductId: string;

  @ManyToOne(() => SellerProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sellerProductId' })
  sellerProduct: SellerProduct;

  @Column('decimal', { precision: 10, scale: 2 })
  discountPrice: number;

  @Column({ type: 'int', default: 0 })
  quantityAvailable: number;

  @Column({ type: 'int', default: 0 })
  quantitySold: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
