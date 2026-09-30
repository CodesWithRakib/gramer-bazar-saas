import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SellerReviewItemDto {
  @ApiProperty({ description: 'Review UUID' })
  id: string;

  @ApiProperty({ description: 'Reviewed product UUID' })
  productId: string;

  @ApiProperty({ example: 'Fresh Organic Red Potato' })
  productNameEn: string;

  @ApiProperty({ example: 'তাজা জৈব লাল আলু' })
  productNameBn: string;

  @ApiProperty({ type: String, nullable: true, description: 'Public product slug' })
  productSlug: string | null;

  @ApiProperty({ type: String, nullable: true, description: 'Primary product image URL' })
  productImage: string | null;

  @ApiProperty({ example: 'Rahim U.', description: 'Privacy-masked reviewer display name' })
  customerName: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  rating: number;

  @ApiProperty({ type: String, nullable: true })
  comment: string | null;

  @ApiProperty({ type: [String], description: 'Reviewer-uploaded image URLs' })
  images: string[];

  @ApiProperty({ description: 'Whether the review is visible on the storefront' })
  isApproved: boolean;

  @ApiProperty({ type: String, nullable: true, description: 'Shop’s public reply' })
  sellerReply: string | null;

  @ApiProperty({ type: String, nullable: true, format: 'date-time' })
  sellerRepliedAt: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;
}

export class SellerReviewListMetaDto {
  @ApiProperty({ example: 18 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class SellerReviewListDto {
  @ApiProperty({ type: [SellerReviewItemDto] })
  data: SellerReviewItemDto[];

  @ApiProperty({ type: SellerReviewListMetaDto })
  meta: SellerReviewListMetaDto;
}

export class SellerReviewRatingBucketDto {
  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({ example: 12 })
  count: number;
}

export class SellerReviewSummaryDto {
  @ApiProperty({ example: 4.6 })
  averageRating: number;

  @ApiProperty({ example: 24 })
  totalReviews: number;

  @ApiProperty({ example: 5, description: 'Reviews that still need a shop reply' })
  unrepliedCount: number;

  @ApiProperty({ type: [SellerReviewRatingBucketDto] })
  distribution: SellerReviewRatingBucketDto[];
}

export class ReplyToReviewDto {
  @ApiProperty({ example: 'Thank you for the feedback! We are glad you liked the freshness.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(2000)
  message: string;
}
