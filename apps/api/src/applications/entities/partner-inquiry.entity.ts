import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PartnerInquiryStatus {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity('partner_inquiries')
@Index('idx_partner_inquiries_status', ['status'])
@Index('idx_partner_inquiries_created_at', ['createdAt'])
export class PartnerInquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_name', type: 'varchar', length: 150 })
  organizationName: string;

  @Column({ name: 'contact_person', type: 'varchar', length: 100, nullable: true })
  contactPerson: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  designation: string | null;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ name: 'partner_type', type: 'varchar', length: 50, default: 'INSTITUTIONAL_BUYER' })
  partnerType: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  location: string | null;

  @Column({ type: 'text', nullable: true })
  requirements: string | null;

  @Column({
    type: 'enum',
    enum: PartnerInquiryStatus,
    default: PartnerInquiryStatus.PENDING,
  })
  status: PartnerInquiryStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
