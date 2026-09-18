import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, type Relation } from 'typeorm';
import { ProductRequest } from './product-request.entity.js';
import { ProductRequestStatus } from '../enums/product-request-status.enum.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('product_request_history')
export class ProductRequestHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_request_id', type: 'uuid' })
  productRequestId: string;

  @ManyToOne(() => ProductRequest, request => request.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_request_id' })
  productRequest: Relation<ProductRequest>;

  @Column({
    type: 'enum',
    enum: ProductRequestStatus,
  })
  status: ProductRequestStatus;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column({ name: 'changed_by_user_id', type: 'uuid', nullable: true })
  changedByUserId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'changed_by_user_id' })
  changedByUser: Relation<User> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
