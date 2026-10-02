import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { BroadcastTemplate } from './broadcast-template.entity.js';
import {
  BroadcastAudienceType,
  BroadcastProviderName,
  BroadcastStatus,
} from '../enums/broadcast.enums.js';

/**
 * Audience configuration snapshot. Only the fields relevant to the selected
 * audienceType are populated. Stored as JSON so new audience types can be added
 * without schema changes.
 */
export interface BroadcastAudienceConfig {
  /** SELECTED_CUSTOMERS */
  customerIds?: string[];
  /** AREA_BASED — any of the location ids */
  districtId?: string | null;
  areaId?: string | null;
  /** ACTIVE / INACTIVE / NO_RECENT_ORDER — lookback window in days */
  inactiveDays?: number | null;
  /** Respect marketing opt-out (default true). */
  isOptInRequired?: boolean;
  /** Optional manual message override / variable mapping. */
  variables?: Record<string, string>;
}

/** A broadcast marketing campaign. Provider-independent. */
@Entity('broadcasts')
@Index('idx_broadcasts_status', ['status'])
@Index('idx_broadcasts_scheduled_at', ['scheduledAt'])
@Index('idx_broadcasts_created_at', ['createdAt'])
export class Broadcast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId: string | null;

  @ManyToOne(() => BroadcastTemplate, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'template_id' })
  template: Relation<BroadcastTemplate> | null;

  /** Snapshot of the template name so history survives template deletion. */
  @Column({ name: 'template_name', type: 'varchar', length: 150, nullable: true })
  templateName: string | null;

  @Column({ type: 'enum', enum: BroadcastProviderName, default: BroadcastProviderName.MOCK })
  provider: BroadcastProviderName;

  @Column({ name: 'audience_type', type: 'enum', enum: BroadcastAudienceType })
  audienceType: BroadcastAudienceType;

  @Column({ name: 'audience_config', type: 'jsonb', nullable: true })
  audienceConfig: BroadcastAudienceConfig | null;

  @Column({ type: 'enum', enum: BroadcastStatus, default: BroadcastStatus.DRAFT })
  status: BroadcastStatus;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt: Date | null;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string | null;

  // Denormalized counters for fast analytics. Source of truth remains
  // broadcast_recipients; these are recalculated as recipients progress.
  @Column({ name: 'total_recipients', type: 'int', default: 0 })
  totalRecipients: number;

  @Column({ name: 'sent_count', type: 'int', default: 0 })
  sentCount: number;

  @Column({ name: 'delivered_count', type: 'int', default: 0 })
  deliveredCount: number;

  @Column({ name: 'read_count', type: 'int', default: 0 })
  readCount: number;

  @Column({ name: 'failed_count', type: 'int', default: 0 })
  failedCount: number;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ name: 'created_by_name', type: 'varchar', length: 200, nullable: true })
  createdByName: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
