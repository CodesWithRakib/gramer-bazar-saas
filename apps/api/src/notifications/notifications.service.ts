import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity.js';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async getUserNotifications(userId: string) {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationRepo.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationRepo.update({ id, userId }, { isRead: true, readAt: new Date() });
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
    return { success: true };
  }

  // --- EVENT LISTENERS ---

  @OnEvent('order.status.changed')
  async handleOrderStatusChanged(payload: { orderId: string, customerId: string, status: string }) {
    await this.notificationRepo.save(this.notificationRepo.create({
      userId: payload.customerId,
      title: 'Order Status Update',
      message: `Your order #${payload.orderId.split('-')[0]} is now ${payload.status}.`,
      type: NotificationType.ORDER_UPDATE,
      data: { orderId: payload.orderId },
    }));
  }

  @OnEvent('productRequest.status.changed')
  async handleProductRequestStatusChanged(payload: { requestId: string, customerId: string, status: string, productName: string }) {
    await this.notificationRepo.save(this.notificationRepo.create({
      userId: payload.customerId,
      title: 'Product Request Update',
      message: `Your request for "${payload.productName}" is now ${payload.status}.`,
      type: NotificationType.REQUEST,
      data: { requestId: payload.requestId },
    }));
  }
}
