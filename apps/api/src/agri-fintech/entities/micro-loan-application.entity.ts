import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum MicroLoanPurpose {
  HIGH_YIELD_SEEDS = 'HIGH_YIELD_SEEDS',
  FERTILIZER_PESTICIDES = 'FERTILIZER_PESTICIDES',
  IRRIGATION_EQUIPMENT = 'IRRIGATION_EQUIPMENT',
  COLD_STORAGE_SOLAR = 'COLD_STORAGE_SOLAR',
  SEASONAL_WORKING_CAPITAL = 'SEASONAL_WORKING_CAPITAL',
}

export enum MicroLoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DISBURSED = 'DISBURSED',
  REPAID = 'REPAID',
  REJECTED = 'REJECTED',
}

@Entity('micro_loan_applications')
export class MicroLoanApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  sellerId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  applicationNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  requestedAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  approvedAmount: number | null;

  @Column({
    type: 'enum',
    enum: MicroLoanPurpose,
    default: MicroLoanPurpose.SEASONAL_WORKING_CAPITAL,
  })
  purpose: MicroLoanPurpose;

  @Column({ type: 'int', default: 6 })
  tenureMonths: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 4.5 })
  interestRate: number; // Annual %

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monthlyEmi: number;

  @Column({ type: 'varchar', length: 100, default: 'BRAC_MICROFINANCE' })
  partnerMfi: string;

  @Column({
    type: 'enum',
    enum: MicroLoanStatus,
    default: MicroLoanStatus.PENDING,
  })
  status: MicroLoanStatus;

  @Column({ type: 'timestamp', nullable: true })
  disbursedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  repaidAt: Date | null;

  @Column({ type: 'text', nullable: true })
  adminNotes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
