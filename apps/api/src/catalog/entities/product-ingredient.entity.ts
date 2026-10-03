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
import { Ingredient } from './ingredient.entity.js';

/**
 * Structured composition of a product: one row per active ingredient, with its
 * strength. Combination medicines (e.g. Paracetamol + Phenylephrine + Caffeine)
 * simply have several rows, so strength is never flattened into a single
 * free-text field.
 */
@Entity('product_ingredients')
@Unique('UQ_product_ingredients_pair', ['productId', 'ingredientId'])
@Index('idx_product_ingredients_product_id', ['productId'])
@Index('idx_product_ingredients_ingredient_id', ['ingredientId'])
export class ProductIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.ingredients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product>;

  @Column({ name: 'ingredient_id', type: 'uuid' })
  ingredientId: string;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.productLinks, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Relation<Ingredient>;

  /** Numeric strength/dose (e.g. 500 for "500 mg"). */
  @Column({
    name: 'strength_value',
    type: 'decimal',
    precision: 14,
    scale: 3,
    nullable: true,
  })
  strengthValue: number | null;

  /** Strength unit (mg, g, ml, mcg, IU…). */
  @Column({ name: 'strength_unit', type: 'varchar', length: 30, nullable: true })
  strengthUnit: string | null;

  /** Concentration percentage where applicable (e.g. 0.5 for 0.5%). */
  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  percentage: number | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
