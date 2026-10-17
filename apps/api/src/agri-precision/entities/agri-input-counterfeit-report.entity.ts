import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('agri_input_counterfeit_reports')
@Index('idx_report_ticket', ['reportTicketNo'], { unique: true })
@Index('idx_report_barcode', ['suspectedItemBarcode'])
@Index('idx_report_district', ['retailShopDistrict'])
export class AgriInputCounterfeitReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'report_ticket_no', type: 'varchar', length: 50, unique: true })
  reportTicketNo: string; // e.g. RPT-2026-F901

  @Column({ name: 'reporter_user_id', type: 'uuid', nullable: true })
  reporterUserId: string | null;

  @Column({ name: 'reporter_name', type: 'varchar', length: 150 })
  reporterName: string;

  @Column({ name: 'reporter_phone', type: 'varchar', length: 30 })
  reporterPhone: string;

  @Column({ name: 'suspected_item_barcode', type: 'varchar', length: 100 })
  suspectedItemBarcode: string;

  @Column({ name: 'brand_name', type: 'varchar', length: 200 })
  brandName: string;

  @Column({ name: 'retail_shop_name', type: 'varchar', length: 200 })
  retailShopName: string;

  @Column({ name: 'retail_shop_district', type: 'varchar', length: 100 })
  retailShopDistrict: string;

  @Column({ name: 'retail_shop_upazila', type: 'varchar', length: 100 })
  retailShopUpazila: string;

  @Column({ name: 'retail_shop_address', type: 'text' })
  retailShopAddress: string;

  @Column({ name: 'suspected_defect_description', type: 'text' })
  suspectedDefectDescription: string; // e.g. Granules did not dissolve, abnormal smell, no pest control efficacy

  @Column({ name: 'evidence_photos', type: 'simple-array', nullable: true })
  evidencePhotos: string[];

  @Column({ name: 'is_escalated_to_dae', type: 'boolean', default: false })
  isEscalatedToDae: boolean; // Escalated to Department of Agricultural Extension law enforcement

  @Column({ name: 'dae_investigation_status', type: 'varchar', length: 50, default: 'SUBMITTED' })
  daeInvestigationStatus: string; // SUBMITTED, UNDER_INSPECTION, SEIZED_CONFIRMED, DISMISSED

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
