import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';
import { Order } from '../orders/entities/order.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Product } from '../catalog/entities/product.entity.js';
import { DemandEvent } from './entities/demand-event.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, Product, DemandEvent])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
