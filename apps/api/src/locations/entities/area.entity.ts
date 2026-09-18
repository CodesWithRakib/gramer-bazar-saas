import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, type Relation } from 'typeorm';
import { Union } from './union.entity.js';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'union_id' })
  unionId: string;

  @ManyToOne(() => Union, (union) => union.areas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'union_id' })
  union: Relation<Union>;

  @Column({ name: 'name_en', length: 100 })
  nameEn: string;

  @Column({ name: 'name_bn', length: 150 })
  nameBn: string;

  @Column({ name: 'delivery_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
