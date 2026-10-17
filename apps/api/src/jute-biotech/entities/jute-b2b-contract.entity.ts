import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PackagingActCategory } from '../enums/jute-biotech.enum.js';

@Entity('jute_b2b_contracts')
export class JuteB2bContract {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  contractCode!: string;

  @Column({ type: 'varchar', length: 150 })
  buyerMillName!: string;

  @Column({ type: 'varchar', length: 80, default: 'BJMC-REG-2026-M88' })
  buyerRegNumber!: string;

  @Column({ type: 'varchar', length: 150 })
  sellerCooperativeName!: string;

  @Column({
    type: 'enum',
    enum: PackagingActCategory,
    default: PackagingActCategory.PADDY_AND_RICE_50KG,
  })
  mandatoryPackagingCategory!: PackagingActCategory;

  @Column({ type: 'varchar', length: 255 })
  productDescription!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 50.0 })
  quantityMetricTonsOrBales!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 85000.0 })
  unitPriceBdt!: number; // BDT per MT or bale bundle

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 4250000.0 })
  totalContractValueBdt!: number;

  @Column({ type: 'date' })
  deliveryDeadline!: string;

  @Column({ type: 'varchar', length: 150, default: 'Ghorashal Central Food Silo & Warehouse' })
  destinationDepot!: string;

  @Column({ type: 'boolean', default: true })
  compliancePackagingAct2010!: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 30.0 })
  escrowDepositPercentage!: number; // 30% advance locked in escrow

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE_ESCROW_FUNDED' })
  escrowStatus!: string;

  @Column({ type: 'boolean', default: true })
  inspectionPassed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
