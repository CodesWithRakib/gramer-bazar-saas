import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';
import { Order } from '../orders/entities/order.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Product } from '../catalog/entities/product.entity.js';
import { DemandEvent } from './entities/demand-event.entity.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { SellerApplication } from '../applications/entities/seller-application.entity.js';
import { RiderApplication } from '../applications/entities/rider-application.entity.js';
import { PayoutRequest } from '../payouts/entities/payout-request.entity.js';
import { Dispute } from '../disputes/entities/dispute.entity.js';
import { ProductRequest } from '../product-requests/entities/product-request.entity.js';
import { Category } from '../catalog/entities/category.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      User,
      Product,
      DemandEvent,
      Shop,
      SellerApplication,
      RiderApplication,
      PayoutRequest,
      Dispute,
      ProductRequest,
      Category,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
