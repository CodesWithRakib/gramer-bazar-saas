import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../orders/enums/order-status.enum.js';

export class DashboardMetricsSummaryDto {
  @ApiProperty({ example: 1250, description: 'Total historical orders' })
  totalOrders: number;

  @ApiProperty({ example: 45, description: 'Currently pending unfulfilled orders' })
  pendingOrders: number;

  @ApiProperty({ example: 485000, description: 'Total gross merchandise volume in BDT' })
  totalSales: number;

  @ApiProperty({ example: 820, description: 'Total registered customers' })
  totalCustomers: number;

  @ApiProperty({ example: 35, description: 'Total active approved sellers' })
  totalSellers: number;

  @ApiProperty({ example: 18, description: 'Total active delivery riders' })
  totalRiders: number;

  @ApiProperty({ example: 250, description: 'Total catalog products' })
  totalProducts: number;
}

export class RecentOrderSummaryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'Rahim Uddin' })
  customerName: string;

  @ApiProperty({ example: 850 })
  totalAmount: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PROCESSING })
  status: OrderStatus;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;
}

export class RevenueTrendItemDto {
  @ApiProperty({ example: 'Mon' })
  name: string;

  @ApiProperty({ example: 12500 })
  revenue: number;
}

export class AdminDashboardResponseDto {
  @ApiProperty({ type: DashboardMetricsSummaryDto })
  metrics: DashboardMetricsSummaryDto;

  @ApiProperty({ type: [RecentOrderSummaryDto] })
  recentOrders: RecentOrderSummaryDto[];

  @ApiProperty({ type: [RevenueTrendItemDto] })
  revenueData: RevenueTrendItemDto[];
}

export class PopularProductAnalyticsDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  productId: string;

  @ApiProperty({ example: 'Fresh Potato' })
  productName: string;

  @ApiProperty({ example: 420 })
  views: number;

  @ApiProperty({ example: 85 })
  carts: number;

  @ApiProperty({ example: 64 })
  purchases: number;
}

export class PopularSearchAnalyticsDto {
  @ApiProperty({ example: 'organic honey' })
  query: string;

  @ApiProperty({ example: 128 })
  count: number;
}

export class PurchaseTrendAnalyticsDto {
  @ApiProperty({ example: '2026-09-26' })
  date: string;

  @ApiProperty({ example: 42 })
  purchases: number;

  @ApiProperty({ example: 78 })
  carts: number;
}

export class CategoryDemandAnalyticsDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  categoryId: string;

  @ApiProperty({ example: 340 })
  count: number;
}

export class UnavailableProductAnalyticsDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  productId: string;

  @ApiProperty({ example: 'Deshi Ghee' })
  productName: string;

  @ApiProperty({ example: 95 })
  views: number;
}

export class RequestedProductAnalyticsDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  productRequestId: string;

  @ApiProperty({ example: 25 })
  requests: number;

  @ApiProperty({ example: 14 })
  purchases: number;

  @ApiProperty({ example: 56.0 })
  conversionRate: number;
}

export class DemandAnalyticsResponseDto {
  @ApiProperty({ type: [PopularProductAnalyticsDto] })
  popularProducts: PopularProductAnalyticsDto[];

  @ApiProperty({ type: [PopularSearchAnalyticsDto] })
  popularSearches: PopularSearchAnalyticsDto[];

  @ApiProperty({ type: [PurchaseTrendAnalyticsDto] })
  purchaseTrends: PurchaseTrendAnalyticsDto[];

  @ApiProperty({ type: [CategoryDemandAnalyticsDto] })
  categoryDemand: CategoryDemandAnalyticsDto[];

  @ApiProperty({ type: [UnavailableProductAnalyticsDto] })
  frequentlyUnavailable: UnavailableProductAnalyticsDto[];

  @ApiProperty({ type: [RequestedProductAnalyticsDto] })
  requestedProducts: RequestedProductAnalyticsDto[];
}
