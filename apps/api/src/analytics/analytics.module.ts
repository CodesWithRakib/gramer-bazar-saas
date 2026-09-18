import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service.js';
import { AnalyticsController } from './analytics.controller.js';
import { Order } from '../orders/entities/order.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Product } from '../catalog/entities/product.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, Product])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
