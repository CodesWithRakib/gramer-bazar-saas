import { ApiProperty } from '@nestjs/swagger';

export class SellerSalesMetricsDto {
  @ApiProperty({ example: 4200, description: 'Settled sales today (BDT)' })
  today: number;

  @ApiProperty({ example: 18200, description: 'Settled sales this week (BDT)' })
  thisWeek: number;

  @ApiProperty({ example: 48600, description: 'Settled sales this calendar month (BDT)' })
  thisMonth: number;

  @ApiProperty({ example: 145000, description: 'Lifetime settled sales (BDT)' })
  lifetime: number;

  @ApiProperty({ example: 1157.14, description: 'Average settled order value this month (BDT)' })
  averageOrderValueThisMonth: number;

  @ApiProperty({ example: 312, description: 'Units sold this calendar month' })
  unitsSoldThisMonth: number;
}

export class SellerOrderMetricsDto {
  @ApiProperty({ example: 6 })
  today: number;

  @ApiProperty({ example: 42 })
  thisMonth: number;

  @ApiProperty({ example: 68 })
  lifetime: number;

  @ApiProperty({ example: 12 })
  awaitingAction: number;

  @ApiProperty({ example: 34 })
  completed: number;

  @ApiProperty({ example: 4 })
  cancelled: number;

  @ApiProperty({ type: [Object], description: 'Distinct order count per status' })
  statusDistribution: Array<{ status: string; count: number }>;
}

export class SellerInventoryMetricsDto {
  @ApiProperty({ example: 25 })
  activeListings: number;

  @ApiProperty({ example: 3 })
  lowStockCount: number;

  @ApiProperty({ example: 1 })
  outOfStockCount: number;

  @ApiProperty({ example: 92500, description: 'Retail value of stock on hand (BDT)' })
  stockValue: number;
}

export class SellerPromotionMetricsDto {
  @ApiProperty({ example: 2 })
  activeCoupons: number;

  @ApiProperty({ example: 4 })
  totalCoupons: number;
}

export class SellerBestSellerDto {
  @ApiProperty()
  listingId: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  nameEn: string;

  @ApiProperty()
  nameBn: string;

  @ApiProperty({ type: String, nullable: true })
  image: string | null;

  @ApiProperty()
  quantitySold: number;

  @ApiProperty()
  revenue: number;
}

export class SellerCategoryRevenueDto {
  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  nameEn: string;

  @ApiProperty()
  nameBn: string;

  @ApiProperty()
  revenue: number;

  @ApiProperty()
  quantitySold: number;
}

export class SellerRevenueTrendPointDto {
  @ApiProperty({ example: '2026-09-26' })
  date: string;

  @ApiProperty({ example: 3200 })
  revenue: number;

  @ApiProperty({ example: 4 })
  orders: number;
}

export class SellerAnalyticsResponseDto {
  @ApiProperty()
  shopId: string;

  @ApiProperty({ format: 'date-time' })
  generatedAt: string;

  @ApiProperty({ type: SellerSalesMetricsDto })
  sales: SellerSalesMetricsDto;

  @ApiProperty({ type: SellerOrderMetricsDto })
  orders: SellerOrderMetricsDto;

  @ApiProperty({ type: SellerInventoryMetricsDto })
  inventory: SellerInventoryMetricsDto;

  @ApiProperty({ type: SellerPromotionMetricsDto })
  promotions: SellerPromotionMetricsDto;

  @ApiProperty({ type: [SellerBestSellerDto] })
  bestSellers: SellerBestSellerDto[];

  @ApiProperty({ type: [SellerCategoryRevenueDto] })
  revenueByCategory: SellerCategoryRevenueDto[];

  @ApiProperty({ type: [SellerRevenueTrendPointDto] })
  revenueTrend: SellerRevenueTrendPointDto[];
}
