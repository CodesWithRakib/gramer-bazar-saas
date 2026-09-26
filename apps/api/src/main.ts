import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {
  ValidationPipe,
  Logger,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import helmet from 'helmet';
import { SwaggerModule } from '@nestjs/swagger';
import { createSwaggerDocument } from './swagger/swagger.config.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  app.use(cookieParser());

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  );

  // CORS configuration
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const corsOriginsRaw = configService.get<string>('CORS_ORIGINS');
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const configuredOrigins: string[] = [];

  if (corsOriginsRaw) {
    configuredOrigins.push(
      ...corsOriginsRaw
        .split(',')
        .map((origin) => origin.trim().replace(/\/+$/, ''))
        .filter(Boolean),
    );
  }

  if (frontendUrl) {
    configuredOrigins.push(frontendUrl.trim().replace(/\/+$/, ''));
  }

  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'https://gramer-bazar-saas.vercel.app',
    'https://gramer-bazar-api.onrender.com',
  ];

  const allowedOrigins = Array.from(
    new Set([...defaultOrigins, ...configuredOrigins]),
  );

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // If wildcard '*' is configured, allow and reflect origin
      if (configuredOrigins.includes('*')) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, '');

      // In development, automatically allow any localhost or 127.0.0.1 on any port
      if (
        nodeEnv === 'development' &&
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)
      ) {
        return callback(null, true);
      }

      // Allow configured origins
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // Support Vercel deployment preview and production URLs (e.g. gramer-bazar-saas-*.vercel.app)
      if (
        /^https:\/\/([a-zA-Z0-9-]+\.)?gramer-bazar-saas(-[a-zA-Z0-9-]+)?\.vercel\.app$/.test(
          normalizedOrigin,
        )
      ) {
        return callback(null, true);
      }

      logger.warn(`Blocked by CORS: origin ${origin}`);
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Range',
    ],
    exposedHeaders: ['Content-Range', 'X-Total-Count', 'Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global Prefix
  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'health', 'docs', 'favicon.ico'],
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Interceptors
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Swagger Setup
  const document = createSwaggerDocument(app);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(
    configService.get<string>('PORT') ??
      configService.get<string>('API_PORT') ??
      configService.get<string>('port') ??
      '4000',
  );

  logger.log(`Resolved port from configService: ${port}`);

  await app.listen(port, '0.0.0.0');

  logger.log(`Application is running on port ${port}`);
  logger.log(`Swagger docs are available at /api/docs`);
}

void bootstrap();
