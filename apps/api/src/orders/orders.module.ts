import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { Order } from './entities/order.entity.js';
import { OrderItem } from './entities/order-item.entity.js';
import { OrderStatusHistory } from './entities/order-status-history.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, OrderStatusHistory])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
