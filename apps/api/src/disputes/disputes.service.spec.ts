import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { DisputesService } from './disputes.service.js';
import { Dispute } from './entities/dispute.entity.js';
import { DisputeMessage } from './entities/dispute-message.entity.js';
import { DisputeInternalNote } from './entities/dispute-internal-note.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { WalletsService } from '../wallets/wallets.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { DisputeStatus } from './enums/dispute-status.enum.js';
import { DisputeReason } from './enums/dispute-reason.enum.js';
import { DisputeResolutionType } from './enums/dispute-resolution-type.enum.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';

describe('DisputesService', () => {
  let service: DisputesService;

  const mockDisputeRepo = {
    create: vi.fn((x) => ({ ...x, id: 'disp-1' })),
    save: vi.fn(async (x) => ({ ...x, id: x.id || 'disp-1', createdAt: new Date() })),
    findOne: vi.fn(),
    find: vi.fn(),
  };

  const mockMessageRepo = {
    create: vi.fn((x) => ({ ...x, id: 'msg-1', createdAt: new Date() })),
    save: vi.fn(async (x) => ({ ...x, id: x.id || 'msg-1', createdAt: new Date() })),
  };

  const mockInternalNoteRepo = {
    create: vi.fn((x) => ({ ...x, id: 'note-1', createdAt: new Date() })),
    save: vi.fn(async (x) => ({ ...x, id: x.id || 'note-1', createdAt: new Date() })),
  };

  const mockOrderRepo = {
    findOne: vi.fn(),
  };

  const mockWalletsService = {
    requestPayoutDebit: vi.fn().mockResolvedValue(undefined),
    approvePayout: vi.fn().mockResolvedValue(undefined),
    creditEarnings: vi.fn().mockResolvedValue(undefined),
  };

  const mockNotificationsService = {
    notifyUser: vi.fn().mockResolvedValue(undefined),
    notifyUsers: vi.fn().mockResolvedValue(undefined),
  };

  const mockAuditLogsService = {
    record: vi.fn().mockResolvedValue(undefined),
  };

  const mockEventEmitter = {
    emit: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputesService,
        { provide: getRepositoryToken(Dispute), useValue: mockDisputeRepo },
        { provide: getRepositoryToken(DisputeMessage), useValue: mockMessageRepo },
        { provide: getRepositoryToken(DisputeInternalNote), useValue: mockInternalNoteRepo },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: WalletsService, useValue: mockWalletsService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<DisputesService>(DisputesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDispute', () => {
    it('creates dispute for delivered order, records audit log, and emits dispute.created', async () => {
      const customerId = 'cust-1';
      const order = {
        id: 'ord-12345678',
        userId: customerId,
        status: OrderStatus.DELIVERED,
        updatedAt: new Date(),
        items: [
          {
            sellerProduct: {
              shop: {
                sellerId: 'seller-1',
              },
            },
          },
        ],
      };

      mockOrderRepo.findOne.mockResolvedValueOnce(order);
      mockDisputeRepo.findOne.mockResolvedValueOnce(null); // No existing dispute

      const result = await service.createDispute(customerId, {
        orderId: 'ord-12345678',
        reason: DisputeReason.DAMAGED,
        description: 'Item arrived broken',
      });

      expect(result).toBeDefined();
      expect(mockDisputeRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId,
          sellerId: 'seller-1',
          status: DisputeStatus.OPEN,
          reason: DisputeReason.DAMAGED,
        })
      );
      expect(mockDisputeRepo.save).toHaveBeenCalled();
      expect(mockAuditLogsService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: customerId,
          action: 'DISPUTE_CREATED',
          targetType: 'Dispute',
        })
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'dispute.created',
        expect.objectContaining({
          orderId: 'ord-12345678',
          customerId,
          sellerId: 'seller-1',
        })
      );
      expect(mockNotificationsService.notifyUser).toHaveBeenCalledWith(
        'seller-1',
        expect.objectContaining({
          titleKey: 'notifications.dispute_opened.title',
        })
      );
    });

    it('throws NotFoundException if order does not exist', async () => {
      mockOrderRepo.findOne.mockResolvedValueOnce(null);

      await expect(
        service.createDispute('cust-1', {
          orderId: 'non-existent',
          reason: DisputeReason.DAMAGED,
          description: 'Not found',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if order is not delivered', async () => {
      mockOrderRepo.findOne.mockResolvedValueOnce({
        id: 'ord-1',
        userId: 'cust-1',
        status: OrderStatus.PROCESSING,
      });

      await expect(
        service.createDispute('cust-1', {
          orderId: 'ord-1',
          reason: DisputeReason.DAMAGED,
          description: 'Still in transit',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('addMessage', () => {
    it('appends message and moves OPEN dispute to UNDER_REVIEW', async () => {
      const dispute = {
        id: 'disp-1',
        orderId: 'ord-1',
        customerId: 'cust-1',
        sellerId: 'seller-1',
        status: DisputeStatus.OPEN,
      };

      mockDisputeRepo.findOne.mockResolvedValueOnce(dispute);

      const result = await service.addMessage('disp-1', 'cust-1', 'customer', {
        message: 'Here is extra info',
      });

      expect(result).toBeDefined();
      expect(dispute.status).toBe(DisputeStatus.UNDER_REVIEW);
      expect(mockDisputeRepo.save).toHaveBeenCalledWith(dispute);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'dispute.message.created',
        expect.objectContaining({
          disputeId: 'disp-1',
          senderId: 'cust-1',
          senderRole: 'CUSTOMER',
        })
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'dispute.status.updated',
        expect.objectContaining({
          disputeId: 'disp-1',
          status: DisputeStatus.UNDER_REVIEW,
        })
      );
      expect(mockNotificationsService.notifyUser).toHaveBeenCalledWith(
        'seller-1',
        expect.objectContaining({
          titleKey: 'notifications.dispute_message.title',
        })
      );
    });

    it('records audit log when admin messages', async () => {
      const dispute = {
        id: 'disp-1',
        customerId: 'cust-1',
        sellerId: 'seller-1',
        status: DisputeStatus.UNDER_REVIEW,
      };

      mockDisputeRepo.findOne.mockResolvedValueOnce(dispute);

      await service.addMessage('disp-1', 'admin-1', 'admin', {
        message: 'Admin intervention',
      });

      expect(mockAuditLogsService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: 'admin-1',
          action: 'DISPUTE_ADMIN_MESSAGE',
          targetId: 'disp-1',
        })
      );
      expect(mockNotificationsService.notifyUsers).toHaveBeenCalledWith(
        ['cust-1', 'seller-1'],
        expect.objectContaining({
          titleKey: 'notifications.dispute_admin_message.title',
        })
      );
    });
  });

  describe('resolveDispute', () => {
    it('resolves dispute with full refund, executes wallet transactions, and emits real-time event', async () => {
      const dispute = {
        id: 'disp-1',
        orderId: 'ord-1',
        customerId: 'cust-1',
        sellerId: 'seller-1',
        status: DisputeStatus.UNDER_REVIEW,
        order: { total: 500 },
      };

      mockDisputeRepo.findOne.mockResolvedValue(dispute);

      const result = await service.resolveDispute('disp-1', 'admin-1', {
        resolutionType: DisputeResolutionType.FULL_REFUND,
        adminDecision: 'Customer refund approved',
        refundAmount: 500,
        internalNote: 'Evidence verified by support',
      });

      expect(result.status).toBe(DisputeStatus.RESOLVED);
      expect(mockWalletsService.requestPayoutDebit).toHaveBeenCalledWith('seller-1', 500);
      expect(mockWalletsService.approvePayout).toHaveBeenCalledWith(
        'seller-1',
        500,
        expect.stringContaining('Dispute Refund')
      );
      expect(mockWalletsService.creditEarnings).toHaveBeenCalledWith(
        'cust-1',
        500,
        expect.stringContaining('Dispute Refund'),
        'disp-1'
      );
      expect(mockAuditLogsService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: 'admin-1',
          action: 'DISPUTE_RESOLVED',
          targetId: 'disp-1',
        })
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'dispute.status.updated',
        expect.objectContaining({
          disputeId: 'disp-1',
          status: DisputeStatus.RESOLVED,
          resolutionType: DisputeResolutionType.FULL_REFUND,
          refundAmount: 500,
        })
      );
      expect(mockNotificationsService.notifyUsers).toHaveBeenCalledWith(
        ['cust-1', 'seller-1'],
        expect.objectContaining({
          titleKey: 'notifications.dispute_resolved.title',
        })
      );
    });
  });

  describe('rejectDispute', () => {
    it('rejects dispute, records audit log, and notifies both parties', async () => {
      const dispute = {
        id: 'disp-1',
        orderId: 'ord-1',
        customerId: 'cust-1',
        sellerId: 'seller-1',
        status: DisputeStatus.UNDER_REVIEW,
      };

      mockDisputeRepo.findOne.mockResolvedValueOnce(dispute);

      const result = await service.rejectDispute('disp-1', 'admin-1', {
        reason: 'Evidence invalid or insufficient',
      });

      expect(result.status).toBe(DisputeStatus.REJECTED);
      expect(mockAuditLogsService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: 'admin-1',
          action: 'DISPUTE_REJECTED',
          targetId: 'disp-1',
        })
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'dispute.status.updated',
        expect.objectContaining({
          disputeId: 'disp-1',
          status: DisputeStatus.REJECTED,
          resolutionType: DisputeResolutionType.REJECTED,
        })
      );
      expect(mockNotificationsService.notifyUsers).toHaveBeenCalledWith(
        ['cust-1', 'seller-1'],
        expect.objectContaining({
          titleKey: 'notifications.dispute_rejected.title',
        })
      );
    });
  });
});
