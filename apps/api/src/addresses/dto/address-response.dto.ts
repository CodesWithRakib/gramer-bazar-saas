import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocationReferenceDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'Rangpur' })
  nameEn: string;

  @ApiProperty({ example: 'রংপুর' })
  nameBn: string;
}

export class AddressResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Address UUID' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', description: 'User UUID owner' })
  userId: string;

  @ApiProperty({ example: 'Home', description: 'Label/Title of the address (e.g. Home, Work, Farm)' })
  title: string;

  @ApiProperty({ example: 'Rahim Uddin', description: 'Recipient contact name' })
  contactName: string;

  @ApiProperty({ example: '01712345678', description: 'Recipient phone number' })
  contactPhone: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', nullable: true })
  countryId: string | null;

  @ApiPropertyOptional({ type: LocationReferenceDto, nullable: true })
  country?: LocationReferenceDto | null;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', nullable: true })
  divisionId: string | null;

  @ApiPropertyOptional({ type: LocationReferenceDto, nullable: true })
  division?: LocationReferenceDto | null;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', nullable: true })
  districtId: string | null;

  @ApiPropertyOptional({ type: LocationReferenceDto, nullable: true })
  district?: LocationReferenceDto | null;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', nullable: true })
  upazilaId: string | null;

  @ApiPropertyOptional({ type: LocationReferenceDto, nullable: true })
  upazila?: LocationReferenceDto | null;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', nullable: true })
  unionId: string | null;

  @ApiPropertyOptional({ type: LocationReferenceDto, nullable: true })
  union?: LocationReferenceDto | null;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', nullable: true })
  areaId: string | null;

  @ApiPropertyOptional({ type: LocationReferenceDto, nullable: true })
  area?: LocationReferenceDto | null;

  @ApiProperty({ example: 'House 12, Village Bhabki, Khansama', description: 'Detailed street and landmark address' })
  streetAddress: string;

  @ApiPropertyOptional({ example: 25.7439, nullable: true, description: 'Latitude coordinate' })
  lat: number | null;

  @ApiPropertyOptional({ example: 88.6369, nullable: true, description: 'Longitude coordinate' })
  lng: number | null;

  @ApiProperty({ example: true, description: 'Whether this is the user default delivery address' })
  isDefault: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}
