import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DeliveriesService } from './deliveries.service.js';
import { DeliveriesController } from './deliveries.controller.js';
import { Delivery } from './entities/delivery.entity.js';
import { DeliveryHistory } from './entities/delivery-history.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderStatusHistory } from '../orders/entities/order-status-history.entity.js';
import { User } from '../users/entities/user.entity.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { RidersModule } from '../riders/riders.module.js';
import { CourierController } from './courier/courier.controller.js';
import { CourierService } from './courier/courier.service.js';
import { MockCourierProvider } from './courier/mock-courier.provider.js';
import { SteadfastCourierProvider } from './courier/steadfast-courier.provider.js';
import { PathaoCourierProvider } from './courier/pathao-courier.provider.js';

import { DispatchCluster } from './entities/dispatch-cluster.entity.js';
import { WarehouseHub } from '../inventory/entities/warehouse-hub.entity.js';
import { LogisticsDispatchService } from './services/logistics-dispatch.service.js';
import { LogisticsDispatchController } from './controllers/logistics-dispatch.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Delivery,
      DeliveryHistory,
      Order,
      OrderStatusHistory,
      User,
      DispatchCluster,
      WarehouseHub,
    ]),
    ConfigModule,
    NotificationsModule,
    RidersModule,
  ],
  controllers: [DeliveriesController, CourierController, LogisticsDispatchController],
  providers: [
    DeliveriesService,
    CourierService,
    MockCourierProvider,
    SteadfastCourierProvider,
    PathaoCourierProvider,
    LogisticsDispatchService,
  ],
  exports: [DeliveriesService, CourierService, LogisticsDispatchService],
})
export class DeliveriesModule {}

