import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import type { FlashSaleItem } from './flash-sale-item.entity.js';

@Entity('flash_sales')
export class FlashSale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  bannerImage: string;

  @OneToMany('FlashSaleItem', (item: FlashSaleItem) => item.flashSale, { cascade: true })
  items: FlashSaleItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
