import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import configuration from './config/configuration.js';
import { envValidationSchema } from './config/env.validation.js';
import { SettingsModule } from './settings/settings.module.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { WsSafeThrottlerGuard } from './common/guards/ws-safe-throttler.guard.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { OtpModule } from './otp/otp.module.js';
import { RolesModule } from './roles/roles.module.js';
import { PermissionsModule } from './permissions/permissions.module.js';
import { LocationsModule } from './locations/locations.module.js';
import { AddressesModule } from './addresses/addresses.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { ShopsModule } from './shops/shops.module.js';
import { InventoryModule } from './inventory/inventory.module.js';
import { PublicModule } from './public/public.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { ProductRequestsModule } from './product-requests/product-requests.module.js';
import { SellerPortalModule } from './seller-portal/seller-portal.module.js';
import { DeliveriesModule } from './deliveries/deliveries.module.js';
import { WishlistsModule } from './wishlists/wishlists.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { CouponsModule } from './coupons/coupons.module.js';
import { ChatModule } from './chat/chat.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { SeederModule } from './seeder/seeder.module.js';
import { BannersModule } from './banners/banners.module.js';
import { WalletsModule } from './wallets/wallets.module.js';
import { PayoutsModule } from './payouts/payouts.module.js';
import { DisputesModule } from './disputes/disputes.module.js';
import { FlashSalesModule } from './flash-sales/flash-sales.module.js';
import { AuditLogsModule } from './audit-logs/audit-logs.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MaintenanceGuard } from './common/guards/maintenance.guard.js';
import { StorageModule } from './storage/storage.module.js';
import { InitialSchema1790406745498 } from './migrations/1790406745498-InitialSchema.js';

@Module({
  imports: [
    StorageModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: (env) => envValidationSchema.parse(env),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('database.url');
        const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
        const isSsl = dbUrl?.includes('sslmode=require') || nodeEnv === 'production';
        const syncEnabled =
          configService.get<string>('DB_SYNCHRONIZE') === 'true' ||
          (nodeEnv !== 'production' && configService.get<string>('DB_SYNCHRONIZE') !== 'false');
        const migrationsRun = configService.get<string>('MIGRATIONS_RUN') === 'true';

        return {
          type: 'postgres',
          url: dbUrl,
          autoLoadEntities: true,
          synchronize: syncEnabled,
          migrations: [InitialSchema1790406745498],
          migrationsRun,
          ssl: isSsl ? { rejectUnauthorized: false } : false,
          logging: nodeEnv === 'development',
        };
      },
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const env = configService.get<string>('NODE_ENV');
        let redisUrl = configService.get<string>('REDIS_URL');

        // Automatically synthesize standard Redis TLS URL if Upstash REST URL and token are provided
        if (!redisUrl) {
          const upstashUrl = configService.get<string>('UPSTASH_REDIS_REST_URL');
          const upstashToken = configService.get<string>('UPSTASH_REDIS_REST_TOKEN');
          if (upstashUrl && upstashToken) {
            try {
              const host = new URL(upstashUrl).hostname;
              redisUrl = `rediss://default:${upstashToken}@${host}:6379`;
            } catch {
              // Ignore malformed URL
            }
          }
        }

        if (env === 'production' && redisUrl) {
          try {
            const store = await redisStore({
              url: redisUrl,
              ttl: 60 * 1000, // 1 minute default TTL
            });
            return { store };
          } catch (err: unknown) {
            new Logger('CacheModule').error(
              `Failed to connect to Redis at ${redisUrl}, falling back to in-memory: ${(err as Error).message}`,
            );
            return { ttl: 60 * 1000 };
          }
        }
        return { ttl: 60 * 1000 }; // In-memory fallback for dev or when redis is not configured
      },
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: Number(process.env.THROTTLE_TTL_MS ?? 60000),
      limit: Number(process.env.THROTTLE_LIMIT ?? 120),
    }]),
    RolesModule,
    PermissionsModule,
    UsersModule,
    OtpModule,
    AuthModule,
    LocationsModule,
    AddressesModule,
    CatalogModule,
    ShopsModule,
    InventoryModule,
    ReviewsModule,
    OrdersModule,
    PublicModule,
    ProductRequestsModule,
    SellerPortalModule,
    DeliveriesModule,
    WishlistsModule,
    NotificationsModule,
    AnalyticsModule,
    CouponsModule,
    ChatModule,
    PaymentsModule,
    SeederModule,
    BannersModule,
    WalletsModule,
    PayoutsModule,
    DisputesModule,
    FlashSalesModule,
    AuditLogsModule,
    SettingsModule,
    ApplicationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: WsSafeThrottlerGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: MaintenanceGuard,
    },
  ],
})
export class AppModule {}
