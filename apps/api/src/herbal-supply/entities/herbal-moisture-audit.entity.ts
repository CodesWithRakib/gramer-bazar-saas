import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GACPStandardGrade } from '../enums/herbal-supply.enum.js';
import { HerbalBatch } from './herbal-batch.entity.js';

@Entity('herbal_moisture_audits')
export class HerbalMoistureAudit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'batch_id' })
  batchId!: string;

  @Column({ name: 'inspector_id' })
  inspectorId!: string;

  @Column({ name: 'inspector_name' })
  inspectorName!: string;

  @Column({ name: 'tested_moisture_percentage', type: 'decimal', precision: 5, scale: 2 })
  testedMoisturePercentage!: number;

  @Column({ name: 'is_aflatoxin_detected', default: false })
  isAflatoxinDetected!: boolean;

  @Column({ name: 'lead_heavy_metal_ppm', type: 'decimal', precision: 6, scale: 3, default: 0.05 })
  leadHeavyMetalPpm!: number;

  @Column({ name: 'foreign_matter_percentage', type: 'decimal', precision: 4, scale: 2, default: 0.2 })
  foreignMatterPercentage!: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: GACPStandardGrade.PHARMA_GRADE_A,
  })
  evaluatedGrade!: GACPStandardGrade;

  @Column({ name: 'compliance_verdict_bn' })
  complianceVerdictBn!: string;

  @Column({ name: 'inspector_notes', type: 'text', nullable: true })
  inspectorNotes!: string | null;

  @ManyToOne(() => HerbalBatch, (batch) => batch.audits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batch_id' })
  batch!: HerbalBatch;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
