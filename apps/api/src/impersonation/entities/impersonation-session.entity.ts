import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ImpersonationReason, ImpersonationStatus } from '../enums/impersonation.enum.js';

/**
 * Durable record of a Super Admin impersonating an end user.
 *
 * This is the source of truth for the actor / effective-user distinction. The
 * Super Admin's own session is never mutated; a temporary access token embeds
 * `act` (actor) and `imp` (this record's id) and expires independently.
 */
@Entity('impersonation_sessions')
@Index('idx_impersonation_actor', ['actorUserId', 'status'])
@Index('idx_impersonation_target', ['targetUserId'])
export class ImpersonationSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** The real authenticated Super Admin. Never the impersonated user. */
  @Column({ name: 'actor_user_id', type: 'uuid' })
  actorUserId: string;

  @Column({ name: 'actor_name', type: 'varchar', length: 200, nullable: true })
  actorName: string | null;

  /** The user whose experience is being viewed (Customer / Seller / Rider). */
  @Column({ name: 'target_user_id', type: 'uuid' })
  targetUserId: string;

  @Column({ name: 'target_name', type: 'varchar', length: 200, nullable: true })
  targetName: string | null;

  @Column({ name: 'target_role', type: 'varchar', length: 50 })
  targetRole: string;

  @Column({ type: 'enum', enum: ImpersonationReason })
  reason: ImpersonationReason;

  @Column({ name: 'reason_note', type: 'text', nullable: true })
  reasonNote: string | null;

  @Column({ type: 'enum', enum: ImpersonationStatus, default: ImpersonationStatus.ACTIVE })
  status: ImpersonationStatus;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'ended_at', type: 'timestamp', nullable: true })
  endedAt: Date | null;

  @Column({ name: 'end_reason', type: 'varchar', length: 100, nullable: true })
  endReason: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 80, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 400, nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;
}
