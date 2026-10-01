import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AudienceType, AnnouncementPriority } from './announcement.entity.js';
import { Role } from '../../roles/enums/role.enum.js';

@Entity('announcement_templates')
export class AnnouncementTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string; // Template name for internal use

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'title_bn', type: 'varchar', length: 255, nullable: true })
  titleBn: string | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'message_bn', type: 'text', nullable: true })
  messageBn: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string | null;

  @Column({ name: 'cta_text', type: 'varchar', length: 100, nullable: true })
  ctaText: string | null;

  @Column({ name: 'cta_link', type: 'varchar', length: 255, nullable: true })
  ctaLink: string | null;

  @Column({ type: 'enum', enum: AnnouncementPriority, default: AnnouncementPriority.NORMAL })
  priority: AnnouncementPriority;

  @Column({ name: 'audience_type', type: 'enum', enum: AudienceType, default: AudienceType.EVERYONE })
  audienceType: AudienceType;

  @Column({ name: 'target_roles', type: 'jsonb', nullable: true })
  targetRoles: Role[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
