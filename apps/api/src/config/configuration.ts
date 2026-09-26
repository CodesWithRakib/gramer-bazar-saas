export default () => ({
  port: parseInt(process.env.PORT || process.env.API_PORT || '4000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origins: (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  apiUrl: process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:4000',
  backendUrl: process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:4000',
  sslcommerz: {
    storeId: process.env.SSLCOMMERZ_STORE_ID,
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD,
    isLive: process.env.SSLCOMMERZ_IS_LIVE === 'true',
    paymentUrl:
      process.env.SSLCOMMERZ_PAYMENT_URL ||
      (process.env.SSLCOMMERZ_IS_LIVE === 'true'
        ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
        : 'https://sandbox-gw.sslcommerz.com/gwprocess/v4/api.php'),
    validationUrl:
      process.env.SSLCOMMERZ_VALIDATION_URL ||
      (process.env.SSLCOMMERZ_IS_LIVE === 'true'
        ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
        : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'),
    publicUrl: process.env.SSLCOMMERZ_PUBLIC_URL || process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:4000',
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    bucket: process.env.SUPABASE_BUCKET || 'gramer-bazar',
  },
});
