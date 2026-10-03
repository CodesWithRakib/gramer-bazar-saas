import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Broadcast } from '../entities/broadcast.entity.js';
import { BroadcastRecipient } from '../entities/broadcast-recipient.entity.js';
import { BroadcastRecipientStatus } from '../enums/broadcast.enums.js';
import {
  QueryUserBroadcastsDto,
  UserBroadcastMessageDto,
  UserBroadcastUnreadCountDto,
} from '../dto/user-broadcast.dto.js';

@Injectable()
export class UserBroadcastsService {
  constructor(
    @InjectRepository(BroadcastRecipient)
    private readonly recipientRepo: Repository<BroadcastRecipient>,
    @InjectRepository(Broadcast)
    private readonly broadcastRepo: Repository<Broadcast>,
  ) {}

  async getMyInbox(
    userId: string,
    query: QueryUserBroadcastsDto = {},
  ): Promise<{
    data: UserBroadcastMessageDto[];
    meta: { total: number; page: number; limit: number; totalPages: number; unreadCount: number };
  }> {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Math.min(Number(query.limit), 100) : 20;

    const qb = this.recipientRepo
      .createQueryBuilder('recipient')
      .innerJoinAndSelect('recipient.broadcast', 'broadcast')
      .where('recipient.customerId = :userId', { userId })
      .orderBy('recipient.createdAt', 'DESC');

    if (query.unreadOnly) {
      qb.andWhere(
        '(recipient.status != :readStatus AND recipient.readAt IS NULL)',
        { readStatus: BroadcastRecipientStatus.READ },
      );
    }

    if (query.search?.trim()) {
      qb.andWhere(
        '(broadcast.title ILIKE :search OR recipient.personalizedMessage ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    const [recipients, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const unreadCount = await this.recipientRepo.count({
      where: [
        { customerId: userId, status: BroadcastRecipientStatus.SENT },
        { customerId: userId, status: BroadcastRecipientStatus.DELIVERED },
      ],
    });

    const data: UserBroadcastMessageDto[] = recipients.map((r) => {
      const isRead = r.status === BroadcastRecipientStatus.READ || r.readAt !== null;
      return {
        id: r.id,
        broadcastId: r.broadcastId,
        title: r.broadcast?.title || 'Platform Announcement',
        templateName: r.broadcast?.templateName || null,
        message: r.personalizedMessage || '',
        status: r.status,
        isRead,
        sentAt: r.sentAt,
        deliveredAt: r.deliveredAt,
        readAt: r.readAt,
        createdAt: r.createdAt,
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    };
  }

  async getUnreadCount(userId: string): Promise<UserBroadcastUnreadCountDto> {
    const unreadCount = await this.recipientRepo.count({
      where: [
        { customerId: userId, status: BroadcastRecipientStatus.SENT },
        { customerId: userId, status: BroadcastRecipientStatus.DELIVERED },
      ],
    });

    return { unreadCount };
  }

  async getMessage(userId: string, id: string): Promise<UserBroadcastMessageDto> {
    const recipient = await this.recipientRepo.findOne({
      where: { id, customerId: userId },
      relations: { broadcast: true },
    });

    if (!recipient) {
      throw new NotFoundException('Broadcast message not found');
    }

    const isRead = recipient.status === BroadcastRecipientStatus.READ || recipient.readAt !== null;

    return {
      id: recipient.id,
      broadcastId: recipient.broadcastId,
      title: recipient.broadcast?.title || 'Platform Announcement',
      templateName: recipient.broadcast?.templateName || null,
      message: recipient.personalizedMessage || '',
      status: recipient.status,
      isRead,
      sentAt: recipient.sentAt,
      deliveredAt: recipient.deliveredAt,
      readAt: recipient.readAt,
      createdAt: recipient.createdAt,
    };
  }

  async markAsRead(userId: string, id: string): Promise<UserBroadcastMessageDto> {
    const recipient = await this.recipientRepo.findOne({
      where: { id, customerId: userId },
      relations: { broadcast: true },
    });

    if (!recipient) {
      throw new NotFoundException('Broadcast message not found');
    }

    if (recipient.status !== BroadcastRecipientStatus.READ) {
      recipient.status = BroadcastRecipientStatus.READ;
      recipient.readAt = new Date();
      await this.recipientRepo.save(recipient);
      await this.broadcastRepo.increment({ id: recipient.broadcastId }, 'readCount', 1);
    }

    return {
      id: recipient.id,
      broadcastId: recipient.broadcastId,
      title: recipient.broadcast?.title || 'Platform Announcement',
      templateName: recipient.broadcast?.templateName || null,
      message: recipient.personalizedMessage || '',
      status: recipient.status,
      isRead: true,
      sentAt: recipient.sentAt,
      deliveredAt: recipient.deliveredAt,
      readAt: recipient.readAt,
      createdAt: recipient.createdAt,
    };
  }

  async markAllAsRead(userId: string): Promise<{ success: boolean; updatedCount: number }> {
    const unread = await this.recipientRepo.find({
      where: [
        { customerId: userId, status: BroadcastRecipientStatus.SENT },
        { customerId: userId, status: BroadcastRecipientStatus.DELIVERED },
      ],
    });

    if (unread.length === 0) {
      return { success: true, updatedCount: 0 };
    }

    const now = new Date();
    for (const r of unread) {
      r.status = BroadcastRecipientStatus.READ;
      r.readAt = now;
      await this.recipientRepo.save(r);
      await this.broadcastRepo.increment({ id: r.broadcastId }, 'readCount', 1);
    }

    return { success: true, updatedCount: unread.length };
  }
}
