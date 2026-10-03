import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  type Relation,
} from 'typeorm';

@Entity('categories')
@Index('idx_categories_parent_id', ['parentId'])
@Index('idx_categories_path', ['path'])
@Index('idx_categories_is_active', ['isActive'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @ManyToOne(() => Category, (category) => category.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Relation<Category> | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Relation<Category>[];

  @Column({ name: 'name_en', length: 150 })
  nameEn: string;

  @Column({ name: 'name_bn', length: 200 })
  nameBn: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'varchar', nullable: true })
  icon: string | null;

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  /**
   * Depth from the root node (root = 0). Maintained by the categories service
   * so deep taxonomies stay queryable without recursive CTEs per request.
   */
  @Column({ name: 'level', type: 'int', default: 0 })
  level: number;

  /**
   * Materialized lineage of slugs, e.g. "electronics/computers-pc/pc-components".
   * Indexed for fast prefix-based subtree and breadcrumb lookups at any depth.
   */
  @Column({ name: 'path', type: 'varchar', length: 1000, nullable: true })
  path: string | null;

  @Column({ name: 'description_en', type: 'text', nullable: true })
  descriptionEn: string | null;

  @Column({ name: 'description_bn', type: 'text', nullable: true })
  descriptionBn: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_regulated', default: false })
  isRegulated: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToMany('Brand', (brand: any) => brand.categories)
  brands: Relation<any>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  productCount?: number;
}
