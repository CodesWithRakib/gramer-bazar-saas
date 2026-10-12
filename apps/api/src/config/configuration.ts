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
    origins: (
      process.env.CORS_ORIGINS ||
      process.env.CORS_ORIGIN ||
      'http://localhost:5000,http://localhost:5001,http://127.0.0.1:5000,http://127.0.0.1:5001,http://localhost:3000,http://127.0.0.1:3000'
    )
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5000',
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
    publicUrl:
      process.env.SSLCOMMERZ_PUBLIC_URL ||
      process.env.BACKEND_URL ||
      process.env.API_URL ||
      'http://localhost:4000',
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    bucket: process.env.SUPABASE_BUCKET || 'gramer-bazar',
  },
  broadcast: {
    // 'mock' (default) or 'whatsapp'. WhatsApp is not implemented yet.
    provider: process.env.BROADCAST_PROVIDER || 'mock',
  },
  sms: {
    provider: process.env.SMS_PROVIDER || 'mock',
    greenweb: {
      token: process.env.GREENWEB_TOKEN,
      url: process.env.GREENWEB_URL || 'https://api.greenweb.com.bd/api.php',
    },
    bulksmsbd: {
      apiKey: process.env.BULKSMSBD_API_KEY,
      senderId: process.env.BULKSMSBD_SENDER_ID || '8809617612345',
      url: process.env.BULKSMSBD_URL || 'http://bulksmsbd.net/api/smsapi',
    },
  },
  courier: {
    defaultProvider: process.env.COURIER_DEFAULT_PROVIDER || 'MOCK',
    steadfast: {
      apiKey: process.env.STEADFAST_API_KEY,
      secretKey: process.env.STEADFAST_SECRET_KEY,
      baseUrl: process.env.STEADFAST_BASE_URL || 'https://portal.steadfast.com.bd/api/v1',
    },
    pathao: {
      clientId: process.env.PATHAO_CLIENT_ID,
      clientSecret: process.env.PATHAO_CLIENT_SECRET,
      username: process.env.PATHAO_USERNAME,
      password: process.env.PATHAO_PASSWORD,
      storeId: process.env.PATHAO_STORE_ID || '1',
      baseUrl: process.env.PATHAO_BASE_URL || 'https://api-hermes.pathao.com',
    },
  },
  bkash: {
    appKey: process.env.BKASH_APP_KEY,
    appSecret: process.env.BKASH_APP_SECRET,
    username: process.env.BKASH_USERNAME,
    password: process.env.BKASH_PASSWORD,
    isSandbox: process.env.BKASH_IS_SANDBOX !== 'false',
    baseUrl:
      process.env.BKASH_BASE_URL ||
      (process.env.BKASH_IS_SANDBOX === 'false'
        ? 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout'
        : 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout'),
  },
});
