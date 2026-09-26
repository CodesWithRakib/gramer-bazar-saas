import type { Schema } from './common.js';

export type Payment = Schema<'PaymentResponseDto'>;
export type InitiatePaymentResponse = Schema<'InitiatePaymentResponseDto'>;

export type InitiatePaymentRequest = Schema<'InitiatePaymentDto'>;
export type PaymentAdminQuery = Schema<'PaymentAdminQueryDto'>;
