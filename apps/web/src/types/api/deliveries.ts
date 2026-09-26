import type { Schema } from './common.js';

export type Delivery = Schema<'DeliveryResponseDto'>;
export type RiderSummary = Schema<'RiderSummaryDto'>;
export type DeliveryHistory = Schema<'DeliveryHistoryResponseDto'>;

export type AssignDeliveryRequest = Schema<'AssignDeliveryDto'>;
export type UpdateDeliveryStatusRequest = Schema<'UpdateDeliveryStatusDto'>;
export type UpdateRiderLocationRequest = Schema<'UpdateRiderLocationDto'>;
