import type { Schema } from './common.js';

export type Coupon = Schema<'CouponResponseDto'>;
export type CouponValidationResult = Schema<'CouponValidationResponseDto'>;

export type CreateCouponRequest = Schema<'CreateCouponDto'>;
export type UpdateCouponRequest = Schema<'UpdateCouponDto'>;
export type ValidateCouponRequest = Schema<'ValidateCouponRequestDto'>;
