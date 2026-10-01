import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../orders/enums/order-status.enum.js';

export class SellerOrderCustomerDto {
  @ApiProperty({ example: 'Rahim Uddin' })
  name: string;

  @ApiProperty({ type: String, nullable: true, example: '01712345678' })
  phone: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Delivery contact name' })
  contactName?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  streetAddress?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Dhaka' })
  district?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  upazila?: string | null;
}

export class SellerOrderItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sellerProductId: string;

  @ApiProperty({ example: 'Fresh Organic Red Potato' })
  nameEn: string;

  @ApiProperty({ example: 'তাজা জৈব লাল আলু' })
  nameBn: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  image: string | null;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 120 })
  unitPrice: number;

  @ApiProperty({ example: 240 })
  subtotal: number;
}

export class SellerOrderSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: '#A1B2C3D4' })
  reference: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ example: 240, description: 'Value of this shop’s items only' })
  sellerSubtotal: number;

  @ApiProperty({ example: 3, description: 'Total items from this shop' })
  itemCount: number;

  @ApiProperty({ type: SellerOrderCustomerDto })
  customer: SellerOrderCustomerDto;

  @ApiProperty({ example: 'COD', enum: ['COD', 'ONLINE'] })
  paymentMethod: string;

  @ApiProperty({ example: 'PENDING' })
  paymentStatus: string;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({
    type: [String],
    enum: OrderStatus,
    description: 'Statuses this seller is allowed to transition the order into',
  })
  allowedNextStatuses: OrderStatus[];
}

export class SellerOrderListMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 32 })
  total: number;

  @ApiProperty({ example: 2 })
  totalPages: number;
}

export class SellerOrderListDto {
  @ApiProperty({ type: [SellerOrderSummaryDto] })
  data: SellerOrderSummaryDto[];

  @ApiProperty({ type: SellerOrderListMetaDto })
  meta: SellerOrderListMetaDto;

  @ApiProperty({ example: 6, description: 'Orders awaiting a seller action' })
  awaitingActionCount: number;
}

export class SellerOrderStatusHistoryDto {
  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiPropertyOptional({ type: String, nullable: true })
  note?: string | null;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;
}

export class SellerOrderDetailDto extends SellerOrderSummaryDto {
  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'Customer user id, exposed only for this shop’s orders so the seller can message the buyer about the order',
  })
  customerUserId: string | null;

  @ApiProperty({ type: [SellerOrderItemDto] })
  items: SellerOrderItemDto[];

  @ApiProperty({ type: [SellerOrderStatusHistoryDto] })
  statusHistory: SellerOrderStatusHistoryDto[];

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Assigned rider name' })
  riderName?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Assigned rider contact phone',
  })
  riderPhone?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Delivery status' })
  deliveryStatus?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Platform-wide note or cancellation reason',
  })
  note?: string | null;
}
