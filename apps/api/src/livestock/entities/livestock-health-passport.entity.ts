import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { VeterinaryHealthStatus, VaccineType } from '../enums/livestock.enum.js';

export interface VaccineRecord {
  vaccine: VaccineType;
  doseDate: string;
  nextDueDate: string;
  batchNo: string;
  administeredBy: string;
}

@Entity('livestock_health_passports')
export class LivestockHealthPassport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  earTagNumber!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  livestockId!: string;

  @Column({ type: 'varchar', length: 255 })
  veterinaryOfficerName!: string;

  @Column({ type: 'varchar', length: 100 })
  veterinaryRegNumber!: string;

  @Column({ type: 'varchar', length: 255 })
  upazilaHospital!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  certifiedAt!: Date;

  @Column({
    type: 'enum',
    enum: VeterinaryHealthStatus,
    default: VeterinaryHealthStatus.CERTIFIED_HEALTHY,
  })
  healthCertification!: VeterinaryHealthStatus;

  @Column({ type: 'decimal', precision: 4, scale: 1, default: 38.5 })
  bodyTemperatureCelsius!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dewormingDate!: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  vaccinationLedger!: VaccineRecord[];

  @Column({ type: 'text', nullable: true })
  healthRemarks!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  certificateQrCode!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
