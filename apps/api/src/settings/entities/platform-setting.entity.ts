import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Simple key/value store for marketplace-wide configuration edited from the
 * admin Settings page. Values are stored as text and coerced by the service.
 */
@Entity('platform_settings')
export class PlatformSetting {
  @PrimaryColumn({ length: 100 })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
