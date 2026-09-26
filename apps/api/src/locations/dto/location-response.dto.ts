import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CountryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Country UUID' })
  id: string;

  @ApiProperty({ example: 'Bangladesh', description: 'Country name in English' })
  nameEn: string;

  @ApiProperty({ example: 'বাংলাদেশ', description: 'Country name in Bengali' })
  nameBn: string;

  @ApiProperty({ example: true, description: 'Whether the country is active for operations' })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Creation timestamp' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Last update timestamp' })
  updatedAt: string;
}

export class DivisionResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Division UUID' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', description: 'Country UUID' })
  countryId: string;

  @ApiProperty({ example: 'Rangpur', description: 'Division name in English' })
  nameEn: string;

  @ApiProperty({ example: 'রংপুর', description: 'Division name in Bengali' })
  nameBn: string;

  @ApiProperty({ example: true, description: 'Active status' })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class DistrictResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'District UUID' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', description: 'Division UUID' })
  divisionId: string;

  @ApiProperty({ example: 'Dinajpur', description: 'District name in English' })
  nameEn: string;

  @ApiProperty({ example: 'দিনাজপুর', description: 'District name in Bengali' })
  nameBn: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class UpazilaResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Upazila UUID' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', description: 'District UUID' })
  districtId: string;

  @ApiProperty({ example: 'Khansama', description: 'Upazila name in English' })
  nameEn: string;

  @ApiProperty({ example: 'খানসামা', description: 'Upazila name in Bengali' })
  nameBn: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class UnionResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Union UUID' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', description: 'Upazila UUID' })
  upazilaId: string;

  @ApiProperty({ example: 'Alokjhari', description: 'Union name in English' })
  nameEn: string;

  @ApiProperty({ example: 'আলোকঝাড়ী', description: 'Union name in Bengali' })
  nameBn: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class AreaResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Area UUID' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', description: 'Union UUID' })
  unionId: string;

  @ApiProperty({ example: 'Alokjhari Center', description: 'Area name in English' })
  nameEn: string;

  @ApiProperty({ example: 'আলোকঝাড়ী কেন্দ্র', description: 'Area name in Bengali' })
  nameBn: string;

  @ApiProperty({ example: 30, description: 'Default local delivery fee in BDT' })
  deliveryFee: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}
