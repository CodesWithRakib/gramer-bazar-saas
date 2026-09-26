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

export class SellerDashboardResponseDto {
  @ApiProperty({ example: 3, description: 'Number of seller products at or below low stock threshold' })
  lowStockCount: number;

  @ApiProperty({ example: 12, description: 'Number of active/unfulfilled customer orders' })
  activeOrdersCount: number;

  @ApiProperty({ example: 145000, description: 'Lifetime delivered sales GMV in BDT' })
  totalSales: number;

  @ApiProperty({ type: [RecentSellerOrderDto], description: 'Recent orders containing items from this vendor' })
  recentOrders: RecentSellerOrderDto[];

  @ApiProperty({ type: [RevenueDataPointDto], description: '7-day revenue trend chart series' })
  revenueData: RevenueDataPointDto[];
}
