import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  type Relation,
} from 'typeorm';
import { Category } from './category.entity.js';
import { ProductTypeAttribute } from './product-type-attribute.entity.js';

/**
 * A Product Type is the concrete kind of product sold inside a category
 * (Processor, Monitor, Router, Laptop…). It is deliberately separate from the
 * category tree so that one category can expose several product types and each
 * product type can own its own attribute schema.
 */
@Entity('product_types')
@Index('idx_product_types_category_id', ['categoryId'])
@Index('idx_product_types_is_active', ['isActive'])
export class ProductType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Relation<Category>;

  @Column({ name: 'name_en', length: 150 })
  nameEn: string;

  @Column({ name: 'name_bn', length: 200 })
  nameBn: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'description_en', type: 'text', nullable: true })
  descriptionEn: string | null;

  @Column({ name: 'description_bn', type: 'text', nullable: true })
  descriptionBn: string | null;

  @Column({ type: 'varchar', nullable: true })
  icon: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => ProductTypeAttribute, (mapping) => mapping.productType, {
    cascade: true,
  })
  attributeMappings: Relation<ProductTypeAttribute[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
