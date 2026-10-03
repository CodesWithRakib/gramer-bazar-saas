import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { UserBroadcastsService } from './user-broadcasts.service.js';
import { BroadcastRecipientStatus } from '../enums/broadcast.enums.js';

describe('UserBroadcastsService', () => {
  let service: UserBroadcastsService;

  const mockRecipient = {
    id: 'rec-1',
    broadcastId: 'b-1',
    customerId: 'user-1',
    customerName: 'Rahim Uddin',
    phone: '+8801820000001',
    personalizedMessage: 'Special Eid Offer for Rahim Uddin',
    status: BroadcastRecipientStatus.DELIVERED,
    sentAt: new Date(),
    deliveredAt: new Date(),
    readAt: null,
    createdAt: new Date(),
    broadcast: {
      id: 'b-1',
      title: 'Eid Mega Sale',
      templateName: 'Flash Sale Template',
    },
  };

  const createQueryBuilder: any = {
    innerJoinAndSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn().mockResolvedValue([[mockRecipient], 1]),
  };

  const recipientRepo = {
    createQueryBuilder: vi.fn(() => createQueryBuilder),
    count: vi.fn().mockResolvedValue(1),
    findOne: vi.fn(),
    find: vi.fn().mockResolvedValue([]),
    save: vi.fn(async (x: any) => x),
  };

  const broadcastRepo = {
    increment: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserBroadcastsService(
      recipientRepo as any,
      broadcastRepo as any,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMyInbox', () => {
    it('returns paginated inbox messages and unread counter', async () => {
      const result = await service.getMyInbox('user-1', { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('rec-1');
      expect(result.data[0].title).toBe('Eid Mega Sale');
      expect(result.data[0].isRead).toBe(false);
      expect(result.meta.total).toBe(1);
      expect(result.meta.unreadCount).toBe(1);
    });
  });

  describe('getUnreadCount', () => {
    it('returns count of sent or delivered unread messages', async () => {
      recipientRepo.count.mockResolvedValueOnce(3);
      const result = await service.getUnreadCount('user-1');
      expect(result.unreadCount).toBe(3);
    });
  });

  describe('getMessage', () => {
    it('returns a single message if found and belongs to user', async () => {
      recipientRepo.findOne.mockResolvedValueOnce(mockRecipient);
      const result = await service.getMessage('user-1', 'rec-1');
      expect(result.id).toBe('rec-1');
      expect(result.title).toBe('Eid Mega Sale');
    });

    it('throws NotFoundException if message does not exist', async () => {
      recipientRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.getMessage('user-1', 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAsRead', () => {
    it('marks message as read and increments broadcast read count', async () => {
      const unreadRec = { ...mockRecipient, status: BroadcastRecipientStatus.DELIVERED, readAt: null };
      recipientRepo.findOne.mockResolvedValueOnce(unreadRec);

      const result = await service.markAsRead('user-1', 'rec-1');
      expect(result.isRead).toBe(true);
      expect(unreadRec.status).toBe(BroadcastRecipientStatus.READ);
      expect(unreadRec.readAt).toBeDefined();
      expect(broadcastRepo.increment).toHaveBeenCalledWith(
        { id: 'b-1' },
        'readCount',
        1,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('marks all unread messages as read', async () => {
      const unreadList = [
        { ...mockRecipient, id: 'rec-1', status: BroadcastRecipientStatus.SENT },
        { ...mockRecipient, id: 'rec-2', status: BroadcastRecipientStatus.DELIVERED },
      ];
      recipientRepo.find.mockResolvedValueOnce(unreadList);

      const result = await service.markAllAsRead('user-1');
      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(2);
      expect(broadcastRepo.increment).toHaveBeenCalledTimes(2);
    });
  });
});
