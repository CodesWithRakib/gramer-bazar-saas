import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Product } from '../../catalog/entities/product.entity.js';
import { ProductRequestStatus } from '../enums/product-request-status.enum.js';
import { ProductRequestHistory } from './product-request-history.entity.js';

@Entity('product_requests')
export class ProductRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ name: 'requested_product_name' })
  requestedProductName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'preferred_information', type: 'text', nullable: true })
  preferredInformation: string | null;

  @Column({
    type: 'enum',
    enum: ProductRequestStatus,
    default: ProductRequestStatus.PENDING,
  })
  status: ProductRequestStatus;

  @Column({ name: 'linked_product_id', type: 'uuid', nullable: true })
  linkedProductId: string | null;

  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'linked_product_id' })
  linkedProduct: Relation<Product> | null;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null;

  @OneToMany(() => ProductRequestHistory, (history) => history.productRequest, {
    cascade: true,
  })
  statusHistory: Relation<ProductRequestHistory[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
