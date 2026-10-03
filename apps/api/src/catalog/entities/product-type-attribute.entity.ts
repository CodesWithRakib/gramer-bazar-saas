import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
  type Relation,
} from 'typeorm';
import { ProductType } from './product-type.entity.js';
import { Attribute } from './attribute.entity.js';

/**
 * Maps an Attribute onto a ProductType and carries the per-mapping
 * configuration: required flag, filter behaviour and spec grouping.
 */
@Entity('product_type_attributes')
@Unique('UQ_product_type_attributes_pair', ['productTypeId', 'attributeId'])
@Index('idx_product_type_attributes_product_type_id', ['productTypeId'])
@Index('idx_product_type_attributes_attribute_id', ['attributeId'])
export class ProductTypeAttribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_type_id', type: 'uuid' })
  productTypeId: string;

  @ManyToOne(() => ProductType, (pt) => pt.attributeMappings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_type_id' })
  productType: Relation<ProductType>;

  @Column({ name: 'attribute_id', type: 'uuid' })
  attributeId: string;

  @ManyToOne(() => Attribute, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Relation<Attribute>;

  @Column({ name: 'is_required', default: false })
  isRequired: boolean;

  @Column({ name: 'is_filterable', default: true })
  isFilterable: boolean;

  /** Logical spec group shown on the product detail page, e.g. "Memory". */
  @Column({ name: 'spec_group', type: 'varchar', length: 100, nullable: true })
  specGroup: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
