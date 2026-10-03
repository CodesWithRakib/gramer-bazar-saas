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
import { ProductIngredient } from './product-ingredient.entity.js';

/**
 * A reusable active ingredient / generic substance (Paracetamol, Ibuprofen,
 * Caffeine…). Generic names live here — NOT as categories — so the taxonomy
 * cannot explode into thousands of nodes while products still carry structured
 * composition.
 */
@Entity('ingredients')
@Index('idx_ingredients_is_active', ['isActive'])
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name_en', type: 'varchar', length: 200 })
  nameEn: string;

  @Column({ name: 'name_bn', type: 'varchar', length: 250 })
  nameBn: string;

  @Column({ type: 'varchar', length: 250, unique: true })
  slug: string;

  /** True when this ingredient may only be dispensed on prescription. */
  @Column({ name: 'is_prescription_only', default: false })
  isPrescriptionOnly: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => ProductIngredient, (link) => link.ingredient)
  productLinks: Relation<ProductIngredient[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
