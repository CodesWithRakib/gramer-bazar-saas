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

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_id', nullable: true })
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

  @Column({ nullable: true })
  icon: string | null;

  @Column({ name: 'is_regulated', default: false })
  isRegulated: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
