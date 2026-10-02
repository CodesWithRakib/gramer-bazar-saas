import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  BroadcastProviderName,
  BroadcastTemplateCategory,
  BroadcastTemplateProviderStatus,
  BroadcastTemplateStatus,
} from '../enums/broadcast.enums.js';

/** One template variable, represented structurally rather than as raw text. */
export interface BroadcastTemplateVariable {
  key: string;
  label?: string | null;
  example?: string | null;
  required?: boolean;
}

/**
 * A reusable marketing/communication template. Provider-agnostic; any
 * WhatsApp-specific mapping (approved template ID, provider status) is stored
 * as metadata so the rest of the system never depends on WhatsApp directly.
 */
@Entity('broadcast_templates')
@Index('idx_broadcast_templates_status', ['status'])
@Index('idx_broadcast_templates_category', ['category'])
export class BroadcastTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** Locale/BCP-47-ish language code, e.g. 'en' or 'bn'. */
  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({
    type: 'enum',
    enum: BroadcastTemplateCategory,
    default: BroadcastTemplateCategory.MARKETING,
  })
  category: BroadcastTemplateCategory;

  /** Message body containing {{variable}} placeholders. */
  @Column({ type: 'text' })
  body: string;

  /** Structured variable definitions: [{ key, label, example, required }]. */
  @Column({ type: 'jsonb', default: () => `'[]'::jsonb` })
  variables: BroadcastTemplateVariable[];

  @Column({ type: 'enum', enum: BroadcastProviderName, default: BroadcastProviderName.MOCK })
  provider: BroadcastProviderName;

  /**
   * Provider-side template identifier. Null until a real provider maps and
   * approves this template. TODO(WHATSAPP): map local template → approved ID.
   */
  @Column({ name: 'provider_template_id', type: 'varchar', length: 200, nullable: true })
  providerTemplateId: string | null;

  @Column({
    name: 'provider_status',
    type: 'enum',
    enum: BroadcastTemplateProviderStatus,
    default: BroadcastTemplateProviderStatus.LOCAL_ONLY,
  })
  providerStatus: BroadcastTemplateProviderStatus;

  @Column({
    type: 'enum',
    enum: BroadcastTemplateStatus,
    default: BroadcastTemplateStatus.DRAFT,
  })
  status: BroadcastTemplateStatus;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
