import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { FarmerCollectionStatus } from '../enums/agent-commerce.enum.js';

@Entity('farmer_produce_collections')
export class FarmerProduceCollection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'collection_code', unique: true, length: 100 })
  collectionCode: string;

  @Column({ name: 'agent_id', type: 'uuid' })
  agentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent: User;

  @Column({ name: 'session_id', type: 'uuid', nullable: true })
  sessionId?: string | null;

  @Column({ name: 'farmer_name', type: 'varchar', length: 150 })
  farmerName: string;

  @Column({ name: 'farmer_phone', type: 'varchar', length: 20 })
  farmerPhone: string;

  @Column({ name: 'village_location', type: 'varchar', length: 255 })
  villageLocation: string;

  @Column({ name: 'crop_type', type: 'varchar', length: 100 })
  cropType: string;

  @Column({
    name: 'quantity_kg',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  quantityKg: number;

  @Column({
    name: 'unit_price_per_kg',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  unitPricePerKg: number;

  @Column({
    name: 'total_payout',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  totalPayout: number;

  @Column({ name: 'paid_from_drawer', type: 'boolean', default: true })
  paidFromDrawer: boolean;

  @Column({ name: 'destination_hub_id', type: 'uuid', nullable: true })
  destinationHubId?: string | null;

  @Column({ name: 'batch_number', type: 'varchar', length: 100, nullable: true })
  batchNumber?: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: FarmerCollectionStatus.COLLECTED,
  })
  status: FarmerCollectionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
