import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ReviewUserSummaryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiPropertyOptional({ example: 'Rahim', nullable: true })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Uddin', nullable: true })
  lastName?: string | null;

  @ApiPropertyOptional({ example: 'https://storage.gramerbazar.com/avatars/user.jpg', nullable: true })
  avatar?: string | null;
}

export class ReviewResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Review UUID' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', description: 'Product UUID' })
  productId: string;

  @ApiProperty({ example: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f', description: 'Author User UUID' })
  userId: string;

  @ApiPropertyOptional({ type: ReviewUserSummaryDto, description: 'Author display summary' })
  user?: ReviewUserSummaryDto;

  @ApiProperty({ example: 5, description: 'Rating score from 1 to 5', minimum: 1, maximum: 5 })
  rating: number;

  @ApiPropertyOptional({ example: 'Very fresh and good quality potatoes. Delivered quickly.', nullable: true })
  comment: string | null;

  @ApiProperty({ example: true, description: 'Whether the review is approved by moderation' })
  isApproved: boolean;

  @ApiPropertyOptional({ type: [String], nullable: true, description: 'Array of customer proof image URLs' })
  images: string[] | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class ModerateReviewDto {
  @ApiProperty({ example: true, description: 'Approval decision: true to approve, false to reject' })
  @IsNotEmpty()
  @IsBoolean()
  isApproved: boolean;
}
