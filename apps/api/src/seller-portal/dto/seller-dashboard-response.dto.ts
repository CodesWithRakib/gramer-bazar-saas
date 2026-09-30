import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../orders/enums/order-status.enum.js';

export class SellerDashboardWalletDto {
  @ApiProperty({ example: 18500, description: 'Withdrawable balance in BDT' })
  balance: number;

  @ApiProperty({ example: 2400, description: 'Earnings still under clearance in BDT' })
  pendingClearance: number;

  @ApiProperty({ example: 74250, description: 'Lifetime credited earnings in BDT' })
  totalEarned: number;

  @ApiProperty({ example: 32000, description: 'Lifetime withdrawn amount in BDT' })
  totalWithdrawn: number;

  @ApiProperty({ example: 5000, description: 'Sum of payout requests awaiting review' })
  pendingPayoutAmount: number;

  @ApiProperty({ example: true, description: 'Whether a wallet record exists for this seller' })
  hasWallet: boolean;
}

export class SellerDashboardRecentOrderDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'Rahim Uddin' })
  customerName: string;

  @ApiProperty({ type: String, nullable: true, example: '01712345678' })
  customerPhone: string | null;

  @ApiProperty({ example: 450, description: 'Value of this shop’s items only' })
  totalAmount: number;

  @ApiProperty({ example: 3 })
  itemCount: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PROCESSING })
  status: OrderStatus;

  @ApiProperty({
    type: [String],
    enum: OrderStatus,
    description: 'Statuses the seller may transition this order into',
  })
  allowedNextStatuses: OrderStatus[];

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;
}

export class RevenueDataPointDto {
  @ApiProperty({ example: '09-26', description: 'Short label for the chart axis' })
  name: string;

  @ApiProperty({ example: '2026-09-26', description: 'ISO calendar date' })
  date: string;

  @ApiProperty({ example: 3200, description: 'Settled revenue in BDT' })
  revenue: number;

  @ApiProperty({ example: 4, description: 'Settled orders on this date' })
  orders: number;
}

export class SellerOrderStatusDto {
  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiProperty({ example: 4 })
  count: number;
}

export class SellerTopProductDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Listing UUID' })
  listingId: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', description: 'Product UUID' })
  productId: string;

  @ApiProperty({ example: 'Fresh Tomato' })
  nameEn: string;

  @ApiProperty({ example: 'তাজা টমেটো' })
  nameBn: string;

  @ApiProperty({ type: String, nullable: true, description: 'Primary image URL' })
  image: string | null;

  @ApiProperty({ example: 48 })
  quantitySold: number;

  @ApiProperty({ example: 4320 })
  revenue: number;
}

export class SellerLowStockItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'Miniket Rice' })
  nameEn: string;

  @ApiProperty({ example: 'মিনিকেট চাল' })
  nameBn: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  sku?: string | null;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 2, description: 'Stock available for sale (excludes reserved)' })
  availableQuantity: number;

  @ApiProperty({ example: 5 })
  lowStockThreshold: number;
}

export class SellerDashboardResponseDto {
  @ApiProperty({ example: 3, description: 'Active listings at or below their low-stock threshold' })
  lowStockCount: number;

  @ApiProperty({ example: 1, description: 'Active listings with zero available stock' })
  outOfStockCount: number;

  @ApiProperty({ example: 12, description: 'Orders still being fulfilled' })
  activeOrdersCount: number;

  @ApiProperty({ example: 5, description: 'Orders awaiting seller confirmation' })
  pendingOrdersCount: number;

  @ApiProperty({ example: 12, description: 'Orders requiring a seller action' })
  awaitingActionCount: number;

  @ApiProperty({ example: 34, description: 'Delivered orders' })
  completedOrdersCount: number;

  @ApiProperty({ example: 48, description: 'Lifetime orders containing this shop’s items' })
  totalOrders: number;

  @ApiProperty({ example: 25, description: 'Active listings in the shop' })
  totalProducts: number;

  @ApiProperty({ example: 145000, description: 'Lifetime settled sales in BDT' })
  totalSales: number;

  @ApiProperty({ example: 4200, description: 'Settled sales today in BDT' })
  todaySales: number;

  @ApiProperty({ example: 6, description: 'Orders received today' })
  todayOrders: number;

  @ApiProperty({ example: 48600, description: 'Settled sales this calendar month in BDT' })
  monthSales: number;

  @ApiProperty({ example: 42, description: 'Orders received this calendar month' })
  monthOrders: number;

  @ApiProperty({ example: 92500, description: 'Retail value of stock on hand in BDT' })
  stockValue: number;

  @ApiProperty({ example: 2, description: 'Currently valid shop coupons' })
  activeCouponsCount: number;

  @ApiProperty({ type: SellerDashboardWalletDto })
  wallet: SellerDashboardWalletDto;

  @ApiProperty({ type: [SellerDashboardRecentOrderDto] })
  recentOrders: SellerDashboardRecentOrderDto[];

  @ApiProperty({ type: [RevenueDataPointDto], description: 'Daily settled revenue series' })
  revenueData: RevenueDataPointDto[];

  @ApiProperty({ type: [SellerOrderStatusDto] })
  orderStatusDistribution: SellerOrderStatusDto[];

  @ApiProperty({ type: [SellerTopProductDto] })
  topProducts: SellerTopProductDto[];

  @ApiProperty({ type: [SellerLowStockItemDto] })
  lowStockProducts: SellerLowStockItemDto[];
}
