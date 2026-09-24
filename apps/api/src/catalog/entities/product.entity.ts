import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Category } from './category.entity.js';
import { Brand } from './brand.entity.js';
import { ProductStatus } from '../enums/product-status.enum.js';
import { ProductVariant } from './product-variant.entity.js';
import { ProductImage } from './product-image.entity.js';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Relation<Category>;

  @Column({ name: 'sub_category_id', type: 'uuid', nullable: true })
  subCategoryId: string | null;

  @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: Relation<Category> | null;

  @Column({ name: 'brand_id', type: 'uuid', nullable: true })
  brandId: string | null;

  @ManyToOne(() => Brand, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'brand_id' })
  brand: Relation<Brand> | null;

  @Column({ name: 'name_en', length: 255 })
  nameEn: string;

  @Column({ name: 'name_bn', length: 255 })
  nameBn: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'short_description_en', type: 'text', nullable: true })
  shortDescriptionEn: string | null;

  @Column({ name: 'short_description_bn', type: 'text', nullable: true })
  shortDescriptionBn: string | null;

  @Column({ name: 'description_en', type: 'text', nullable: true })
  descriptionEn: string | null;

  @Column({ name: 'description_bn', type: 'text', nullable: true })
  descriptionBn: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  barcode: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number | null;

  @Column({ name: 'compare_at_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  compareAtPrice: number | null;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string | null;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string | null;

  @Column({ name: 'source_product_id', type: 'varchar', length: 100, nullable: true })
  sourceProductId: string | null;

  @Column({ name: 'source_url', type: 'text', nullable: true })
  sourceUrl: string | null;

  @Column({ name: 'source_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  sourcePrice: number | null;

  @Column({ name: 'source_currency', type: 'varchar', length: 10, nullable: true })
  sourceCurrency: string | null;

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
  })
  images: Relation<ProductImage>[];

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: Relation<ProductVariant>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
