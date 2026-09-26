import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BannerResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'Eid Special Discount' })
  title: string;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-banner.jpg' })
  imageUrl: string;

  @ApiPropertyOptional({ example: '/catalog?category=eid-special', nullable: true })
  linkUrl?: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 1 })
  displayOrder: number;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  updatedAt: string;
}
