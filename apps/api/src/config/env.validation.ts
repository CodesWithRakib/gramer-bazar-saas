import { z } from 'zod';

export const envValidationSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'provision']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().optional(),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001'),
  // Rate limiting. Defaults are production-safe; raise them (e.g. in .env for
  // local E2E runs) when automated journeys hit the limits from one IP.
  THROTTLE_TTL_MS: z.coerce.number().optional(),
  THROTTLE_LIMIT: z.coerce.number().optional(),
  AUTH_SEND_OTP_THROTTLE_LIMIT: z.coerce.number().optional(),
  AUTH_VERIFY_OTP_THROTTLE_LIMIT: z.coerce.number().optional(),
  AUTH_REGISTER_THROTTLE_LIMIT: z.coerce.number().optional(),
  AUTH_LOGIN_THROTTLE_LIMIT: z.coerce.number().optional(),
  // SSLCOMMERZ Payment Gateway
  SSLCOMMERZ_STORE_ID: z.string().optional(),
  SSLCOMMERZ_STORE_PASSWORD: z.string().optional(),
  SSLCOMMERZ_IS_LIVE: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => val === true || val === 'true'),
  SSLCOMMERZ_PAYMENT_URL: z.string().optional(),
  SSLCOMMERZ_VALIDATION_URL: z.string().optional(),
  SSLCOMMERZ_PUBLIC_URL: z.string().optional(),
  API_URL: z.string().optional(),
  API_PORT: z.coerce.number().optional(),
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  RESEND_FROM_NAME: z.string().optional(),
  UPLOAD_DIR: z.string().optional(),
  MAX_IMAGE_SIZE_BYTES: z.coerce.number().optional(),
  PRODUCT_IMAGE_BASE_URL: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  SUPABASE_BUCKET: z.string().default('gramer-bazar'),
  DB_SYNCHRONIZE: z.string().optional(),
}).passthrough();

