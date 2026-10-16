import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum MandiTrendDirection {
  UP = 'UP',
  DOWN = 'DOWN',
  STABLE = 'STABLE',
}

@Entity('mandi_prices')
export class MandiPriceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 120 })
  cropName: string;

  @Column({ type: 'varchar', length: 120 })
  cropNameBn: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  commodityGroup: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  division: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  district: string;

  @Column({ type: 'varchar', length: 120 })
  marketName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  minPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  maxPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  modalPrice: number;

  @Column({ type: 'varchar', length: 20, default: 'kg' })
  priceUnit: string;

  @Column({
    type: 'enum',
    enum: MandiTrendDirection,
    default: MandiTrendDirection.STABLE,
  })
  trendDirection: MandiTrendDirection;

  @Column({ type: 'date' })
  recordedDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
