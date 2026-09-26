import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShopResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Shop UUID' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', description: 'Seller User UUID' })
  sellerId: string;

  @ApiProperty({ example: 'Khansama Organic Agro', description: 'Shop title in English' })
  nameEn: string;

  @ApiProperty({ example: 'খানসামা অর্গানিক এগ্রো', description: 'Shop title in Bengali' })
  nameBn: string;

  @ApiProperty({ example: 'khansama-organic-agro', description: 'Unique shop storefront URL slug' })
  slug: string;

  @ApiPropertyOptional({ example: 'Direct farm produce from local growers', nullable: true })
  shortDescription: string | null;

  @ApiPropertyOptional({ example: 'Detailed description of shop operations...', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ example: 'https://storage.gramerbazar.com/shops/logo.png', nullable: true })
  logo: string | null;

  @ApiPropertyOptional({ example: 'https://storage.gramerbazar.com/shops/banner.jpg', nullable: true })
  banner: string | null;

  @ApiPropertyOptional({ example: '01712345678', nullable: true })
  phone: string | null;

  @ApiPropertyOptional({ example: '01812345678', nullable: true })
  secondaryPhone: string | null;

  @ApiPropertyOptional({ example: '01712345678', nullable: true })
  whatsapp: string | null;

  @ApiPropertyOptional({ example: 'shop@gramerbazar.com', nullable: true })
  email: string | null;

  @ApiPropertyOptional({ example: 'https://farm.example.com', nullable: true })
  website: string | null;

  @ApiPropertyOptional({ example: 'https://facebook.com/khansamaagro', nullable: true })
  facebook: string | null;

  @ApiPropertyOptional({ example: 'https://instagram.com/khansamaagro', nullable: true })
  instagram: string | null;

  @ApiPropertyOptional({ example: 'Khansama Bazar Road, Dinajpur', nullable: true })
  address: string | null;

  @ApiPropertyOptional({ example: 'Khansama Center', nullable: true })
  area: string | null;

  @ApiPropertyOptional({ example: 'Dinajpur', nullable: true })
  district: string | null;

  @ApiPropertyOptional({ example: 'Khansama', nullable: true })
  upazila: string | null;

  @ApiPropertyOptional({ example: 'Bhabki', nullable: true })
  union: string | null;

  @ApiPropertyOptional({ example: 'Purba Bhabki', nullable: true })
  village: string | null;

  @ApiPropertyOptional({ example: 25.7439, nullable: true })
  latitude: number | null;

  @ApiPropertyOptional({ example: 88.6369, nullable: true })
  longitude: number | null;

  @ApiPropertyOptional({ example: '8:00 AM - 8:00 PM', nullable: true })
  openingHours: string | null;

  @ApiPropertyOptional({ example: 'Hyperlocal same-day delivery available', nullable: true })
  deliveryInfo: string | null;

  @ApiProperty({ example: true, description: 'Whether shop KYC is verified' })
  isVerified: boolean;

  @ApiProperty({ example: true, description: 'Whether active and accepting orders' })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}
