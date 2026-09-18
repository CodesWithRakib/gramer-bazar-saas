export default () => ({
  port: parseInt(process.env.API_PORT || process.env.PORT || '4000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
});
