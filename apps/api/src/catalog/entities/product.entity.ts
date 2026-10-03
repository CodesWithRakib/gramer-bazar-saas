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
import { Brand } from './brand.entity.js';
import { Shop } from '../../shops/entities/shop.entity.js';
import { ProductStatus } from '../enums/product-status.enum.js';
import { ProductVariant } from './product-variant.entity.js';
import { ProductImage } from './product-image.entity.js';
import { ProductType } from './product-type.entity.js';
import { ProductAttributeValue } from './product-attribute-value.entity.js';
import { Manufacturer } from './manufacturer.entity.js';
import { ProductIngredient } from './product-ingredient.entity.js';

@Entity('products')
@Index('idx_products_category_id', ['categoryId'])
@Index('idx_products_sub_category_id', ['subCategoryId'])
@Index('idx_products_brand_id', ['brandId'])
@Index('idx_products_product_type_id', ['productTypeId'])
@Index('idx_products_is_featured', ['isFeatured'])
@Index('idx_products_is_active', ['isActive'])
@Index('idx_products_status', ['status'])
@Index('idx_products_created_at', ['createdAt'])
@Index('idx_products_owner_shop_id', ['ownerShopId'])
@Index('idx_products_manufacturer_id', ['manufacturerId'])
@Index('idx_products_requires_prescription', ['requiresPrescription'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Set when the catalog record was created by a seller through the seller
   * portal. Admin-imported / master-catalog products keep this null and are
   * owned by the platform. Sellers may only mutate products they own.
   */
  @Column({ name: 'owner_shop_id', type: 'uuid', nullable: true })
  ownerShopId: string | null;

  @ManyToOne(() => Shop, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'owner_shop_id' })
  ownerShop: Relation<Shop> | null;

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

  @Column({ name: 'product_type_id', type: 'uuid', nullable: true })
  productTypeId: string | null;

  @ManyToOne(() => ProductType, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'product_type_id' })
  productType: Relation<ProductType> | null;

  @Column({ name: 'brand_id', type: 'uuid', nullable: true })
  brandId: string | null;

  @ManyToOne(() => Brand, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'brand_id' })
  brand: Relation<Brand> | null;

  /**
   * Legal producer of the product. Kept separate from the brand so a brand can
   * be manufactured by a different company (pharma requirement). Nullable so
   * non-medicine verticals are unaffected.
   */
  @Column({ name: 'manufacturer_id', type: 'uuid', nullable: true })
  manufacturerId: string | null;

  @ManyToOne(() => Manufacturer, (manufacturer) => manufacturer.products, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'manufacturer_id' })
  manufacturer: Relation<Manufacturer> | null;

  /**
   * Sellability flag consumed by cart/checkout validation for regulated goods.
   * Mirrors the `prescription-required` attribute for fast enforcement without
   * a join; both are populated from the same product authoring flow.
   */
  @Column({ name: 'requires_prescription', default: false })
  requiresPrescription: boolean;

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

  @Column({
    name: 'compare_at_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
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

  @Column({
    name: 'source_product_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  sourceProductId: string | null;

  @Column({ name: 'source_url', type: 'text', nullable: true })
  sourceUrl: string | null;

  @Column({
    name: 'source_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  sourcePrice: number | null;

  @Column({
    name: 'source_currency',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  sourceCurrency: string | null;

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
  })
  images: Relation<ProductImage>[];

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: Relation<ProductVariant>[];

  @OneToMany(() => ProductAttributeValue, (value) => value.product, {
    cascade: true,
  })
  attributeValues: Relation<ProductAttributeValue>[];

  @OneToMany(() => ProductIngredient, (link) => link.product, {
    cascade: true,
  })
  ingredients: Relation<ProductIngredient[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
