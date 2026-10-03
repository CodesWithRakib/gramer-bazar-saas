import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  type Relation,
} from 'typeorm';
import { Product } from './product.entity.js';

/**
 * Pharmaceutical manufacturer (Beximco Pharmaceuticals Ltd., Square
 * Pharmaceuticals…). Deliberately separate from {@link Brand}: a brand such as
 * "Napa" is product identity, while the manufacturer is the legal producer.
 * A manufacturer may own many brands and vice-versa.
 */
@Entity('manufacturers')
@Index('idx_manufacturers_is_active', ['isActive'])
export class Manufacturer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name_en', type: 'varchar', length: 200 })
  nameEn: string;

  @Column({ name: 'name_bn', type: 'varchar', length: 250 })
  nameBn: string;

  @Column({ type: 'varchar', length: 250, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string | null;

  @Column({ type: 'varchar', nullable: true })
  logo: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Product, (product) => product.manufacturer)
  products: Relation<Product[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
