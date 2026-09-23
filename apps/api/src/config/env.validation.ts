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
});
