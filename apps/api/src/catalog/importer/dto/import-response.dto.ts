import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImportMode, ImportStatus } from '../entities/import-log.entity.js';

export class ImportLogResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Import log UUID' })
  id: string;

  @ApiProperty({ example: 'dummyjson', description: 'Data provider source' })
  source: string;

  @ApiProperty({ enum: ImportMode, example: ImportMode.IMPORT })
  mode: ImportMode;

  @ApiProperty({ enum: ImportStatus, example: ImportStatus.COMPLETED })
  status: ImportStatus;

  @ApiProperty({ example: 20, description: 'Total records scanned' })
  totalRecords: number;

  @ApiProperty({ example: 18, description: 'Records successfully ingested' })
  importedCount: number;

  @ApiProperty({ example: 2, description: 'Records skipped or failed' })
  failedCount: number;

  @ApiPropertyOptional({ example: null, nullable: true })
  errorMessage?: string | null;

  @ApiPropertyOptional({ example: {}, description: 'Detailed run metrics and sample keys' })
  details?: Record<string, any>;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;
}
