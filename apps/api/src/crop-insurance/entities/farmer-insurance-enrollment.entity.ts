import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { EnrollmentStatus } from '../enums/insurance.enum.js';
import { CropInsurancePolicy } from './crop-insurance-policy.entity.js';
import { ParametricClaimDisbursement } from './parametric-claim-disbursement.entity.js';

@Entity('farmer_insurance_enrollments')
@Index('idx_enrollment_num', ['enrollmentNumber'], { unique: true })
@Index('idx_enrollment_farmer', ['farmerId'])
@Index('idx_enrollment_policy', ['policyId'])
@Index('idx_enrollment_status', ['status'])
export class FarmerInsuranceEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'enrollment_number', type: 'varchar', length: 50, unique: true })
  enrollmentNumber: string; // e.g. INS-2026-X7K9

  @Column({ name: 'policy_id', type: 'uuid' })
  policyId: string;

  @ManyToOne(() => CropInsurancePolicy, (p) => p.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'policy_id' })
  policy: Relation<CropInsurancePolicy>;

  @Column({ name: 'farmer_id', type: 'uuid' })
  farmerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farmer_id' })
  farmer: Relation<User>;

  @Column({ type: 'varchar', length: 150 })
  farmerName: string;

  @Column({ type: 'varchar', length: 30 })
  farmerPhone: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  farmerNid: string | null;

  @Column({ type: 'text' })
  plotAddress: string;

  @Column({ type: 'varchar', length: 100 })
  plotDistrict: string;

  @Column({ type: 'varchar', length: 100 })
  plotUpazila: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  plotUnion: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  plotVillage: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  plotDagNo: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  plotGpsLat: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  plotGpsLng: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  landAreaBighas: number; // e.g. 2.5 Bighas

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalSumInsured: number; // sumInsuredPerBigha * landAreaBighas

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  grossPremium: number; // premiumPerBigha * landAreaBighas

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subsidyAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  netPremiumPaid: number; // farmerPayablePerBigha * landAreaBighas

  @Column({ type: 'varchar', length: 30 })
  payoutMfsNumber: string; // bKash or Nagad wallet number for instant disaster claim payout

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @OneToMany(() => ParametricClaimDisbursement, (c) => c.enrollment)
  claims: Relation<ParametricClaimDisbursement>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
