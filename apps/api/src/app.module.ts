import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import configuration from './config/configuration.js';
import { envValidationSchema } from './config/env.validation.js';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: (env) => envValidationSchema.parse(env),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url'),
        autoLoadEntities: true,
        synchronize: true,
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const env = configService.get<string>('NODE_ENV');
        if (env === 'production') {
          const store = await redisStore({
            url: configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
            ttl: 60 * 1000, // 1 minute default TTL
          });
          return { store };
        }
        return { ttl: 60 * 1000 }; // In-memory fallback for dev
      },
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 120,
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
