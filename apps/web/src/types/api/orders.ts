import type { Schema } from './common.js';

export type Order = Schema<'OrderResponseDto'>;
export type OrderItem = Schema<'OrderItemResponseDto'>;
export type OrderStatusHistory = Schema<'OrderStatusHistoryResponseDto'>;
export type CheckoutResponse = Schema<'CheckoutResponseDto'>;

export type CheckoutRequest = Schema<'CheckoutDto'>;
export type CreateOrderRequest = Schema<'CheckoutDto'>;
export type UpdateOrderStatusRequest = Schema<'UpdateOrderStatusDto'>;
export type TransitionOrderRequest = Schema<'TransitionOrderDto'>;
export type CancelOrderRequest = Schema<'TransitionOrderDto'>;
