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
import { ProductVariant } from './product-variant.entity.js';
import { BatchStatus } from '../enums/medicine-batch-status.enum.js';

/**
 * A physical stock batch of a sellable variant. Batches let medicine inventory
 * be tracked per expiry (FEFO — First Expiry First Out) without changing the
 * generic `inventory` table used by every other vertical.
 *
 * Availability rule: a variant that has batches is only sellable while it has
 * at least one ACTIVE, unexpired batch with remaining quantity. Variants with
 * no batches keep using the plain inventory quantity — so Electronics and every
 * future non-medicine vertical are untouched.
 */
@Entity('medicine_batches')
@Unique('UQ_medicine_batches_variant_number', ['productVariantId', 'batchNumber'])
@Index('idx_medicine_batches_variant_id', ['productVariantId'])
@Index('idx_medicine_batches_expiry_date', ['expiryDate'])
@Index('idx_medicine_batches_status', ['status'])
export class MedicineBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_variant_id', type: 'uuid' })
  productVariantId: string;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: Relation<ProductVariant>;

  @Column({ name: 'batch_number', type: 'varchar', length: 100 })
  batchNumber: string;

  @Column({ name: 'manufacturing_date', type: 'date', nullable: true })
  manufacturingDate: string | null;

  @Column({ name: 'expiry_date', type: 'date' })
  expiryDate: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ name: 'reserved_quantity', type: 'int', default: 0 })
  reservedQuantity: number;

  @Column({ name: 'supplier', type: 'varchar', length: 200, nullable: true })
  supplier: string | null;

  @Column({
    name: 'purchase_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  purchaseCost: number | null;

  @Column({ type: 'enum', enum: BatchStatus, default: BatchStatus.ACTIVE })
  status: BatchStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
