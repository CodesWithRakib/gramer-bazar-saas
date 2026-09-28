import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationsService } from './notifications.service.js';
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from './entities/notification.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Role } from '../roles/enums/role.enum.js';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockNotificationRepo: any;
  let mockUserRepo: any;
  let mockEventEmitter: any;

  beforeEach(async () => {
    mockNotificationRepo = {
      create: vi.fn((dto) => ({ ...dto, id: 'notif-1', isRead: false, createdAt: new Date() })),
      save: vi.fn((entity) =>
        Promise.resolve(
          Array.isArray(entity)
            ? entity
            : { ...entity, id: entity.id || 'notif-1', createdAt: new Date() },
        ),
      ),
      find: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(3),
      findOne: vi.fn(),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      }),
    };

    mockUserRepo = {
      createQueryBuilder: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([{ id: 'admin-1' }, { id: 'admin-2' }]),
      }),
    };

    mockEventEmitter = {
      emit: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: getRepositoryToken(Notification), useValue: mockNotificationRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a notification and emits notification.created event', async () => {
    const result = await service.create({
      userId: 'user-123',
      type: NotificationType.ORDER_CREATED,
      title: 'Order Placed',
      message: 'Your order has been placed',
      titleKey: 'notifications.order_created.title',
      messageKey: 'notifications.order_created.message',
      priority: NotificationPriority.HIGH,
      data: { orderId: 'order-1' },
    });

    expect(result).toBeDefined();
    expect(mockNotificationRepo.create).toHaveBeenCalled();
    expect(mockNotificationRepo.save).toHaveBeenCalled();
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      'notification.created',
      expect.objectContaining({
        userId: 'user-123',
        type: NotificationType.ORDER_CREATED,
        priority: NotificationPriority.HIGH,
      }),
    );
  });

  it('notifies all users with a specific role', async () => {
    const results = await service.notifyRole(Role.ADMIN, {
      type: NotificationType.SELLER_APPLICATION_SUBMITTED,
      title: 'New Seller Application',
      message: 'Application received',
      priority: NotificationPriority.HIGH,
    });

    expect(results).toBeDefined();
    expect(mockUserRepo.createQueryBuilder).toHaveBeenCalled();
    expect(mockNotificationRepo.create).toHaveBeenCalledTimes(2);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      'notification.created',
      expect.objectContaining({ userId: 'admin-1' }),
    );
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      'notification.created',
      expect.objectContaining({ userId: 'admin-2' }),
    );
  });

  it('returns unread count from index query', async () => {
    const result = await service.getUnreadCount('user-123');
    expect(result.count).toBe(3);
    expect(mockNotificationRepo.count).toHaveBeenCalledWith({
      where: { userId: 'user-123', isRead: false },
    });
  });

  it('marks a notification as read and emits notification.read event', async () => {
    mockNotificationRepo.findOne.mockResolvedValue({
      id: 'notif-1',
      userId: 'user-123',
      isRead: false,
    });

    const result = await service.markAsRead('notif-1', 'user-123');
    expect(result.isRead).toBe(true);
    expect(mockNotificationRepo.save).toHaveBeenCalled();
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('notification.read', {
      id: 'notif-1',
      userId: 'user-123',
    });
  });

  it('marks all notifications as read and emits notification.all_read event', async () => {
    const result = await service.markAllAsRead('user-123');
    expect(result.success).toBe(true);
    expect(mockNotificationRepo.update).toHaveBeenCalled();
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('notification.all_read', {
      userId: 'user-123',
    });
  });
});
