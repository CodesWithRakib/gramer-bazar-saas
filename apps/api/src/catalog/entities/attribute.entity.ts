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
import { AttributeDataType } from '../enums/attribute-data-type.enum.js';
import { AttributeOption } from './attribute-option.entity.js';

/**
 * Reusable attribute definition (Brand, Socket, Screen Size, Dosage Form…).
 * Attributes are global and mapped to product types, never hard-coded per
 * category.
 */
@Entity('attributes')
export class Attribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name_en', length: 150 })
  nameEn: string;

  @Column({ name: 'name_bn', length: 200 })
  nameBn: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'data_type', type: 'enum', enum: AttributeDataType, default: AttributeDataType.TEXT })
  dataType: AttributeDataType;

  /** Optional unit suffix for numeric/range values, e.g. "GHz", "W", "inch". */
  @Column({ type: 'varchar', length: 30, nullable: true })
  unit: string | null;

  @Column({ name: 'is_filterable', default: true })
  isFilterable: boolean;

  /** True when this attribute is used to build product variants (e.g. Capacity). */
  @Column({ name: 'is_variant_axis', default: false })
  isVariantAxis: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => AttributeOption, (option) => option.attribute, { cascade: true })
  options: Relation<AttributeOption[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
