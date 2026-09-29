import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveriesService } from './deliveries.service.js';
import { DeliveriesController } from './deliveries.controller.js';
import { Delivery } from './entities/delivery.entity.js';
import { DeliveryHistory } from './entities/delivery-history.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderStatusHistory } from '../orders/entities/order-status-history.entity.js';
import { User } from '../users/entities/user.entity.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { RidersModule } from '../riders/riders.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delivery, DeliveryHistory, Order, OrderStatusHistory, User]),
    NotificationsModule,
    RidersModule,
  ],
  controllers: [DeliveriesController],
  providers: [DeliveriesService],
})
export class DeliveriesModule {}
