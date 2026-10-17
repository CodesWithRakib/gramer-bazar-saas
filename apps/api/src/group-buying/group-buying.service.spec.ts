import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroupBuyingService } from './group-buying.service.js';
import {
  GroupBuyCampaignStatus,
  GroupBuyPaymentMode,
  GroupBuyPoolStatus,
} from './enums/group-buying.enum.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('GroupBuyingService', () => {
  let service: GroupBuyingService;
  let mockCampaignRepo: any;
  let mockPoolRepo: any;
  let mockMemberRepo: any;
  let mockProductRepo: any;
  let mockUserRepo: any;
  let mockDataSource: any;

  beforeEach(() => {
    mockCampaignRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'campaign-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'campaign-uuid-1', ...entity })),
      createQueryBuilder: vi.fn(),
    };

    mockPoolRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'pool-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'pool-uuid-1', ...entity })),
    };

    mockMemberRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'member-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'member-uuid-1', ...entity })),
    };

    mockProductRepo = {
      findOne: vi.fn(),
    };

    mockUserRepo = {
      findOne: vi.fn(),
    };

    mockDataSource = {
      getRepository: vi.fn(),
    };

    service = new GroupBuyingService(
      mockCampaignRepo,
      mockPoolRepo,
      mockMemberRepo,
      mockProductRepo,
      mockUserRepo,
      mockDataSource,
    );
  });

  describe('createCampaign', () => {
    it('successfully creates a group buy campaign with valid bulk discount', async () => {
      const result = await service.createCampaign('seller-1', {
        titleEn: 'Bulk Fertilizer Urea Pool',
        titleBn: 'পাইকারি ইউরিয়া সার সমবায় ক্রয়',
        sellerProductId: 'prod-1',
        regularPrice: 1200,
        groupPrice: 950,
        minParticipants: 5,
        durationHours: 48,
        dropPointName: 'Sariakandi Union Parishad Square',
      });

      expect(mockCampaignRepo.create).toHaveBeenCalled();
      expect(result.regularPrice).toBe(1200);
      expect(result.groupPrice).toBe(950);
      expect(result.minParticipants).toBe(5);
      expect(result.status).toBe(GroupBuyCampaignStatus.ACTIVE);
    });

    it('throws BadRequestException if group price is not lower than regular price', async () => {
      await expect(
        service.createCampaign('seller-1', {
          titleEn: 'Invalid Campaign',
          titleBn: 'ভুল ক্যাম্পেইন',
          sellerProductId: 'prod-1',
          regularPrice: 1000,
          groupPrice: 1200, // Invalid! Group price higher
          minParticipants: 5,
          dropPointName: 'Local Point',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('startPool', () => {
    it('creates pool, generates unique shareCode, and sets leader member', async () => {
      mockCampaignRepo.findOne.mockResolvedValueOnce({
        id: 'camp-1',
        targetDistrict: 'BOGRA',
        groupPrice: 950,
        durationHours: 48,
        minParticipants: 5,
        status: GroupBuyCampaignStatus.ACTIVE,
      });

      const mockSavedPool = {
        id: 'pool-1',
        campaignId: 'camp-1',
        shareCode: 'GB-BOGR-1234',
        leaderUserId: 'user-leader',
        currentParticipants: 1,
        currentCommittedQty: 2,
        status: GroupBuyPoolStatus.FORMING,
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
      };

      mockPoolRepo.save.mockResolvedValueOnce(mockSavedPool);
      mockPoolRepo.findOne.mockResolvedValueOnce(mockSavedPool);

      const result = await service.startPool('user-leader', {
        campaignId: 'camp-1',
        quantity: 2,
        customerName: 'Kader Ali',
        customerPhone: '01711122233',
        deliveryAddress: 'Sariakandi, Ward 2',
      });

      expect(mockPoolRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          campaignId: 'camp-1',
          leaderUserId: 'user-leader',
          currentParticipants: 1,
          status: GroupBuyPoolStatus.FORMING,
        }),
      );
      expect(mockMemberRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-leader',
          isLeader: true,
          quantity: 2,
          unitPrice: 950,
          totalAmount: 1900,
        }),
      );
      expect(result.status).toBe(GroupBuyPoolStatus.FORMING);
    });
  });

  describe('joinPool', () => {
    it('increments participants and triggers SUCCESS when threshold is reached', async () => {
      const mockPool = {
        id: 'pool-1',
        campaignId: 'camp-1',
        shareCode: 'GB-BOGR-1234',
        currentParticipants: 4, // 4 current, need 5
        currentCommittedQty: 8,
        status: GroupBuyPoolStatus.FORMING,
        expiresAt: new Date(Date.now() + 1000000),
        campaign: {
          id: 'camp-1',
          minParticipants: 5,
          groupPrice: 950,
        },
        members: [
          { userId: 'u1' },
          { userId: 'u2' },
          { userId: 'u3' },
          { userId: 'u4' },
        ],
      };

      mockPoolRepo.findOne
        .mockResolvedValueOnce(mockPool)
        .mockResolvedValueOnce({
          ...mockPool,
          currentParticipants: 5,
          status: GroupBuyPoolStatus.SUCCESS,
        });

      const updated = await service.joinPool('user-5', 'pool-1', {
        quantity: 1,
        customerName: 'Tareq Rahman',
        customerPhone: '01855566677',
        deliveryAddress: 'Sariakandi Ghat',
      });

      expect(mockPoolRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          currentParticipants: 5,
          status: GroupBuyPoolStatus.SUCCESS,
        }),
      );
      expect(updated.status).toBe(GroupBuyPoolStatus.SUCCESS);
    });

    it('rejects join request if pool has already expired', async () => {
      const expiredPool = {
        id: 'pool-1',
        status: GroupBuyPoolStatus.FORMING,
        expiresAt: new Date(Date.now() - 100000), // In the past!
        members: [],
      };

      mockPoolRepo.findOne.mockResolvedValueOnce(expiredPool);

      await expect(
        service.joinPool('user-2', 'pool-1', {
          quantity: 1,
          customerName: 'Tareq Rahman',
          customerPhone: '01855566677',
          deliveryAddress: 'Sariakandi Ghat',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects join request if user already joined this pool', async () => {
      const mockPool = {
        id: 'pool-1',
        status: GroupBuyPoolStatus.FORMING,
        expiresAt: new Date(Date.now() + 1000000),
        members: [{ userId: 'user-existing' }],
      };

      mockPoolRepo.findOne.mockResolvedValueOnce(mockPool);

      await expect(
        service.joinPool('user-existing', 'pool-1', {
          quantity: 1,
          customerName: 'Repeat Buyer',
          customerPhone: '01700000000',
          deliveryAddress: 'Same Village',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPoolByShareCode', () => {
    it('returns pool by social share code', async () => {
      const mockPool = {
        id: 'pool-1',
        shareCode: 'GB-BOGR-4921',
        status: GroupBuyPoolStatus.FORMING,
        expiresAt: new Date(Date.now() + 1000000),
      };

      mockPoolRepo.findOne.mockResolvedValueOnce(mockPool);

      const res = await service.getPoolByShareCode('gb-bogr-4921');
      expect(res.shareCode).toBe('GB-BOGR-4921');
    });

    it('throws NotFoundException if share code is invalid', async () => {
      mockPoolRepo.findOne.mockResolvedValueOnce(null);

      await expect(service.getPoolByShareCode('GB-NOTFOUND')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
