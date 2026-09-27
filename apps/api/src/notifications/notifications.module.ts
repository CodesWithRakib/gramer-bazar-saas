import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';
import { ConfigModule } from '@nestjs/config';
import { Notification } from './entities/notification.entity.js';
import { User } from '../users/entities/user.entity.js';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Notification, User])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
