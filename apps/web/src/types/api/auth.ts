import type { Schema } from './common.js';

export type AuthUser = Schema<'AuthUserDto'>;
export type AuthResponse = Schema<'AuthResponseDto'>;
export type UserProfile = Schema<'UserProfileResponseDto'>;
export type SendOtpResponse = Schema<'SendOtpResponseDto'>;
export type DevOtpResponse = Schema<'DevOtpResponseDto'>;

export type LoginRequest = Schema<'LoginDto'>;
export type SendOtpRequest = Schema<'SendOtpDto'>;
export type VerifyOtpRequest = Schema<'VerifyOtpDto'>;
