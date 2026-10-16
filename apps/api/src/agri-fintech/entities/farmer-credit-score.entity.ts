import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CreditTier {
  PLATINUM = 'PLATINUM',
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  BRONZE = 'BRONZE',
}

@Entity('farmer_credit_scores')
export class FarmerCreditScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  sellerId: string;

  @Column({ type: 'int', default: 550 })
  score: number; // 300 to 850 range

  @Column({
    type: 'enum',
    enum: CreditTier,
    default: CreditTier.BRONZE,
  })
  tier: CreditTier;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 20000.0 })
  maxEligibleAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 95.0 })
  fulfillmentRate: number; // Percentage 0 - 100%

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.0 })
  totalLifetimeSales: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  disputeRate: number; // Percentage 0 - 100%

  @Column({ type: 'jsonb', nullable: true })
  scoringFactors: Record<string, any> | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastCalculatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
