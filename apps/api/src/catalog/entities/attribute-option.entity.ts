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
import { Attribute } from './attribute.entity.js';

/**
 * A selectable value for a SELECT / MULTI_SELECT attribute.
 * The option list doubles as the dynamic filter facet value list.
 */
@Entity('attribute_options')
@Unique('UQ_attribute_options_attribute_slug', ['attributeId', 'slug'])
@Index('idx_attribute_options_attribute_id', ['attributeId'])
export class AttributeOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'attribute_id', type: 'uuid' })
  attributeId: string;

  @ManyToOne(() => Attribute, (attribute) => attribute.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Relation<Attribute>;

  @Column({ length: 150 })
  value: string;

  @Column({ name: 'value_bn', type: 'varchar', length: 200, nullable: true })
  valueBn: string | null;

  @Column()
  slug: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
