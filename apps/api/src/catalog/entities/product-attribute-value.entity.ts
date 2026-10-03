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
import { Product } from './product.entity.js';
import { Attribute } from './attribute.entity.js';
import { AttributeOption } from './attribute-option.entity.js';

/**
 * A structured specification value on a product. The typed columns let filters
 * compare numerics/booleans without casting text, while optionId powers the
 * facet value lists for SELECT / MULTI_SELECT attributes.
 */
@Entity('product_attribute_values')
@Unique('UQ_product_attribute_values_pair', ['productId', 'attributeId'])
@Index('idx_product_attribute_values_product_id', ['productId'])
@Index('idx_product_attribute_values_attribute_id', ['attributeId'])
@Index('idx_product_attribute_values_option_id', ['optionId'])
export class ProductAttributeValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.attributeValues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product>;

  @Column({ name: 'attribute_id', type: 'uuid' })
  attributeId: string;

  @ManyToOne(() => Attribute, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Relation<Attribute>;

  @Column({ name: 'option_id', type: 'uuid', nullable: true })
  optionId: string | null;

  @ManyToOne(() => AttributeOption, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'option_id' })
  option: Relation<AttributeOption> | null;

  @Column({ name: 'value_text', type: 'text', nullable: true })
  valueText: string | null;

  @Column({ name: 'value_number', type: 'decimal', precision: 14, scale: 3, nullable: true })
  valueNumber: number | null;

  @Column({ name: 'value_boolean', type: 'boolean', nullable: true })
  valueBoolean: boolean | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
