import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '../enums/application-status.enum.js';

export class SellerApplicationResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  userId: string;

  @ApiProperty({ example: 'Green Agro Farm' })
  shopNameEn: string;

  @ApiProperty({ example: 'গ্রিন এগ্রো ফার্ম' })
  shopNameBn: string;

  @ApiProperty({ example: 'green-agro-farm' })
  shopSlug: string;

  @ApiProperty({ example: '01711223344' })
  phone: string;

  @ApiPropertyOptional({ example: 'agro@example.com', nullable: true })
  email?: string | null;

  @ApiPropertyOptional({ example: 'Fresh village produce', nullable: true })
  description?: string | null;

  @ApiPropertyOptional({ example: 'Khansama Bazar, Dinajpur', nullable: true })
  address?: string | null;

  @ApiPropertyOptional({ example: 'TL-12345678', nullable: true })
  tradeLicenseNumber?: string | null;

  @ApiPropertyOptional({ example: '19901234567890123', nullable: true })
  nidNumber?: string | null;

  @ApiProperty({ enum: ApplicationStatus, example: ApplicationStatus.PENDING })
  status: ApplicationStatus;

  @ApiPropertyOptional({ example: 'Approved after verification', nullable: true })
  adminNotes?: string | null;

  @ApiPropertyOptional({ example: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', nullable: true })
  reviewerId?: string | null;

  @ApiPropertyOptional({ example: '2026-09-26T10:00:00.000Z', nullable: true })
  reviewedAt?: string | null;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  updatedAt: string;
}

export class RiderApplicationResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  userId: string;

  @ApiProperty({ example: 'Rahim Uddin' })
  fullName: string;

  @ApiProperty({ example: '01711223344' })
  phone: string;

  @ApiPropertyOptional({ example: 'rider@example.com', nullable: true })
  email?: string | null;

  @ApiProperty({ example: '19901234567890123' })
  nidNumber: string;

  @ApiProperty({ example: 'BIKE' })
  vehicleType: string;

  @ApiPropertyOptional({ example: 'DHA-HA-123456', nullable: true })
  vehiclePlateNumber?: string | null;

  @ApiPropertyOptional({ example: 'DL-987654321', nullable: true })
  drivingLicenseNumber?: string | null;

  @ApiPropertyOptional({ example: 'Khansama Sadar', nullable: true })
  preferredZone?: string | null;

  @ApiPropertyOptional({ example: '01811223344', nullable: true })
  emergencyContact?: string | null;

  @ApiProperty({ enum: ApplicationStatus, example: ApplicationStatus.PENDING })
  status: ApplicationStatus;

  @ApiPropertyOptional({ example: 'Approved after verification', nullable: true })
  adminNotes?: string | null;

  @ApiPropertyOptional({ example: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', nullable: true })
  reviewerId?: string | null;

  @ApiPropertyOptional({ example: '2026-09-26T10:00:00.000Z', nullable: true })
  reviewedAt?: string | null;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  updatedAt: string;
}
