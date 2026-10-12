import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum WarehouseHubType {
  CENTRAL = 'CENTRAL',
  REGIONAL = 'REGIONAL',
  UPAZILA = 'UPAZILA',
  UNION_POINT = 'UNION_POINT',
}

@Entity('warehouse_hubs')
export class WarehouseHub {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: WarehouseHubType,
    default: WarehouseHubType.REGIONAL,
  })
  hubType: WarehouseHubType;

  @Column({ type: 'varchar', length: 100 })
  division: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  upazila: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  contactPhone: string | null;

  @Column({ type: 'int', default: 5000 })
  capacityKg: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
