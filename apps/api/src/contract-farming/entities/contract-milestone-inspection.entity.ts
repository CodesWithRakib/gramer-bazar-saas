import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { MilestoneStage } from '../enums/contract-farming.enum.js';
import { ContractFarmingAgreement } from './contract-farming-agreement.entity.js';

@Entity('contract_milestone_inspections')
@Index('idx_milestone_agreement', ['agreementId'])
@Index('idx_milestone_inspector', ['inspectorId'])
@Index('idx_milestone_stage', ['milestoneStage'])
export class ContractMilestoneInspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agreement_id', type: 'uuid' })
  agreementId: string;

  @ManyToOne(() => ContractFarmingAgreement, (a) => a.inspections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agreement_id' })
  agreement: Relation<ContractFarmingAgreement>;

  @Column({ name: 'inspector_id', type: 'uuid' })
  inspectorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspector_id' })
  inspector: Relation<User>;

  @Column({
    name: 'milestone_stage',
    type: 'enum',
    enum: MilestoneStage,
  })
  milestoneStage: MilestoneStage;

  @Column({ name: 'is_passed', type: 'boolean', default: true })
  isPassed: boolean;

  @Column({ name: 'germination_rate_pct', type: 'decimal', precision: 5, scale: 2, nullable: true })
  germinationRatePct: number | null; // e.g. 92.5%

  @Column({ name: 'crop_health_score', type: 'int', default: 90 })
  cropHealthScore: number; // 1-100 score

  @Column({ name: 'pest_infestation_level', type: 'varchar', length: 50, default: 'NONE' })
  pestInfestationLevel: string; // NONE, LOW, MODERATE, HIGH

  @Column({ name: 'growth_observations', type: 'text' })
  growthObservations: string;

  @Column({ name: 'inspection_photos', type: 'simple-array', nullable: true })
  inspectionPhotos: string[];

  @Column({ name: 'recommendations', type: 'text', nullable: true })
  recommendations: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
