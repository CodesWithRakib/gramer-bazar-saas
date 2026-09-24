import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ImportStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ImportMode {
  DRY_RUN = 'DRY_RUN',
  IMPORT = 'IMPORT',
  RETRY_IMAGES = 'RETRY_IMAGES',
}

@Entity('import_logs')
export class ImportLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  source: string;

  @Column({ type: 'enum', enum: ImportMode, default: ImportMode.IMPORT })
  mode: ImportMode;

  @Column({ type: 'enum', enum: ImportStatus, default: ImportStatus.RUNNING })
  status: ImportStatus;

  @Column({ name: 'total_fetched', type: 'int', default: 0 })
  totalFetched: number;

  @Column({ name: 'created_count', type: 'int', default: 0 })
  createdCount: number;

  @Column({ name: 'updated_count', type: 'int', default: 0 })
  updatedCount: number;

  @Column({ name: 'skipped_count', type: 'int', default: 0 })
  skippedCount: number;

  @Column({ name: 'duplicates_count', type: 'int', default: 0 })
  duplicatesCount: number;

  @Column({ name: 'failed_count', type: 'int', default: 0 })
  failedCount: number;

  @Column({ name: 'image_failures_count', type: 'int', default: 0 })
  imageFailuresCount: number;

  @Column({ name: 'mapping_failures_count', type: 'int', default: 0 })
  mappingFailuresCount: number;

  @Column({ name: 'error_summary', type: 'text', nullable: true })
  errorSummary: string | null;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null;

  @Column({ name: 'started_at', type: 'timestamp with time zone' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp with time zone', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
