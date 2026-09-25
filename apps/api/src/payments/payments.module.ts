import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service.js';
import { PaymentsController } from './payments.controller.js';
import { Order } from '../orders/entities/order.entity.js';
import { Payment } from './entities/payment.entity.js';
import { User } from '../users/entities/user.entity.js';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order, User]),
    ConfigModule,
    NotificationsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
