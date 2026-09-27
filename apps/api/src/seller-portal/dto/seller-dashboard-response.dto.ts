import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../orders/enums/order-status.enum.js';

export class RecentSellerOrderDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'Rahim Uddin' })
  customerName: string;

  @ApiProperty({ example: 450 })
  totalAmount: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PROCESSING })
  status: OrderStatus;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;
}

export class RevenueDataPointDto {
  @ApiProperty({ example: 'Mon', description: 'Day of week' })
  name: string;

  @ApiProperty({ example: 3200, description: 'Revenue in BDT' })
  revenue: number;
}

export class SellerOrderStatusDto {
  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiProperty({ example: 4 })
  count: number;
}

export class SellerTopProductDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'Fresh Tomato' })
  nameEn: string;

  @ApiProperty({ example: 'তাজা টমেটো' })
  nameBn: string;

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

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 5 })
  lowStockThreshold: number;
}

export class SellerDashboardResponseDto {
  @ApiProperty({
    example: 3,
    description: 'Number of seller products at or below low stock threshold',
  })
  lowStockCount: number;

  @ApiProperty({
    example: 12,
    description: 'Number of active/unfulfilled customer orders',
  })
  activeOrdersCount: number;

  @ApiProperty({ example: 5, description: 'Number of pending customer orders' })
  pendingOrdersCount: number;

  @ApiProperty({ example: 48, description: 'Total historical customer orders' })
  totalOrders: number;

  @ApiProperty({ example: 25, description: 'Total catalog products in shop' })
  totalProducts: number;

  @ApiProperty({
    example: 145000,
    description: 'Lifetime delivered sales GMV in BDT',
  })
  totalSales: number;

  @ApiProperty({
    type: [RecentSellerOrderDto],
    description: 'Recent orders containing items from this vendor',
  })
  recentOrders: RecentSellerOrderDto[];

  @ApiProperty({
    type: [RevenueDataPointDto],
    description: '7-day revenue trend chart series',
  })
  revenueData: RevenueDataPointDto[];

  @ApiProperty({
    type: [SellerOrderStatusDto],
    description: 'Order breakdown by status',
  })
  orderStatusDistribution: SellerOrderStatusDto[];

  @ApiProperty({
    type: [SellerTopProductDto],
    description: 'Top performing products by sales volume',
  })
  topProducts: SellerTopProductDto[];

  @ApiProperty({
    type: [SellerLowStockItemDto],
    description: 'Products needing restock',
  })
  lowStockProducts: SellerLowStockItemDto[];
}
