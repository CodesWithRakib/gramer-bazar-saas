import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Marketing consent, kept separate from the user entity to avoid bloating the
 * core table and to make the consent model explicit and auditable.
 *
 * Design decision (soft opt-in): a customer with NO row here is treated as
 * opted-in, matching Gramer Bazar's existing practice of notifying customers.
 * Once a row exists, `whatsappMarketingOptIn = false` is a hard opt-out and the
 * audience resolver excludes that customer from all marketing audiences.
 *
 * Transactional notifications (order/payment/delivery) are separate from this
 * marketing consent and are unaffected by it.
 */
@Entity('customer_marketing_preferences')
@Index('idx_customer_marketing_preferences_user', ['userId'], { unique: true })
export class CustomerMarketingPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ name: 'whatsapp_marketing_opt_in', type: 'boolean', default: true })
  whatsappMarketingOptIn: boolean;

  @Column({ name: 'opted_out_at', type: 'timestamp', nullable: true })
  optedOutAt: Date | null;

  /** Where the consent decision came from, e.g. 'default', 'profile', 'import'. */
  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string | null;

  @Column({ name: 'consent_updated_at', type: 'timestamp', nullable: true })
  consentUpdatedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
