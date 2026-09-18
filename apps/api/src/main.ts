import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe, Logger, ClassSerializerInterceptor } from '@nestjs/common';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
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
        .map((origin) => origin.trim())
        .filter(Boolean),
    );
  }
  if (frontendUrl) {
    configuredOrigins.push(frontendUrl.trim());
  }

  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
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

      // In development, automatically allow any localhost or 127.0.0.1 on any port
      if (
        nodeEnv === 'development' &&
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }

      // Allow configured origins
      if (allowedOrigins.includes(origin)) {
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
  app.setGlobalPrefix('api/v1');

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
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('Gramer Bazar API')
    .setDescription('The Gramer Bazar hyperlocal marketplace API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('API_PORT') || 4000;
  logger.log(`Resolved port from configService: ${port}`);
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api/v1`);
  logger.log(
    `Swagger docs are available on: http://localhost:${port}/api/docs`,
  );
}
void bootstrap();
