import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../enums/order-status.enum.js';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';
import { AddressResponseDto } from '../../addresses/dto/address-response.dto.js';
import { SellerProductResponseDto } from '../../inventory/dto/seller-product-response.dto.js';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class OrderItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Order item UUID' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', description: 'Order UUID' })
  orderId: string;

  @ApiProperty({ example: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f', description: 'SellerProduct UUID' })
  sellerProductId: string;

  @ApiPropertyOptional({ type: () => SellerProductResponseDto, description: 'Seller product details' })
  sellerProduct?: SellerProductResponseDto;

  @ApiProperty({ example: 2, description: 'Quantity purchased' })
  quantity: number;

  @ApiProperty({ example: 45, description: 'Price per unit in BDT' })
  unitPrice: number;

  @ApiProperty({ example: 90, description: 'Subtotal item price in BDT' })
  subtotal: number;
}

export class OrderStatusHistoryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e' })
  orderId: string;

  @ApiPropertyOptional({ enum: OrderStatus, nullable: true })
  fromStatus: OrderStatus | null;

  @ApiProperty({ enum: OrderStatus })
  toStatus: OrderStatus;

  @ApiPropertyOptional({ example: 'Payment confirmed via SSLCOMMERZ', nullable: true })
  reason: string | null;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;
}

export class OrderResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Order UUID' })
  id: string;

  @ApiProperty({ example: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', description: 'Customer User UUID' })
  userId: string;

  @ApiPropertyOptional({ type: () => UserResponseDto, description: 'Customer user details' })
  user?: UserResponseDto;

  @ApiProperty({ example: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f', description: 'Delivery Address UUID' })
  addressId: string;

  @ApiPropertyOptional({ type: () => AddressResponseDto, description: 'Delivery address snapshot' })
  address?: AddressResponseDto;

  @ApiProperty({ example: 450, description: 'Items subtotal in BDT' })
  subtotal: number;

  @ApiProperty({ example: 40, description: 'Hyperlocal delivery charge in BDT' })
  deliveryFee: number;

  @ApiProperty({ example: 50, description: 'Coupon or promotion discount in BDT' })
  discount: number;

  @ApiProperty({ example: 440, description: 'Net final payable total in BDT' })
  total: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING, description: 'Order lifecycle fulfillment status' })
  status: OrderStatus;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.ONLINE, description: 'Payment method chosen by customer' })
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID, description: 'Payment transaction settlement status' })
  paymentStatus: PaymentStatus;

  @ApiPropertyOptional({ example: 'GBZ_20260926_1234', nullable: true, description: 'Unique payment gateway transaction identifier' })
  transactionId: string | null;

  @ApiProperty({ type: [OrderItemResponseDto], description: 'List of order line items' })
  items: OrderItemResponseDto[];

  @ApiPropertyOptional({ type: [OrderStatusHistoryResponseDto], description: 'Audit trail of order lifecycle status changes' })
  statusHistory?: OrderStatusHistoryResponseDto[];

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  updatedAt: string;
}

export class CheckoutResponseDto {
  @ApiProperty({ type: OrderResponseDto, description: 'Created order record' })
  order: OrderResponseDto;

  @ApiPropertyOptional({ example: 'https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q=...', nullable: true, description: 'Redirect URL for payment gateway (null for Cash on Delivery)' })
  paymentUrl: string | null;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.CONFIRMED, description: 'Target order status' })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
