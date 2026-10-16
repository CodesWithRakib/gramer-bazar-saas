import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentCommerceService } from './agent-commerce.service.js';
import {
  AgentCashTxType,
  AgentSessionStatus,
  FarmerCollectionStatus,
  SettlementChannel,
  SettlementStatus,
} from './enums/agent-commerce.enum.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AgentCommerceService', () => {
  let service: AgentCommerceService;
  let mockSessionRepo: any;
  let mockTxRepo: any;
  let mockCollectionRepo: any;
  let mockSettlementRepo: any;
  let mockUserRepo: any;
  let mockDataSource: any;
  let mockOrdersService: any;

  beforeEach(() => {
    mockSessionRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'session-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'session-uuid-1', ...entity })),
    };

    mockTxRepo = {
      create: vi.fn((entity) => ({ id: 'tx-uuid-1', createdAt: new Date(), ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'tx-uuid-1', createdAt: new Date(), ...entity })),
    };

    mockCollectionRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'col-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'col-uuid-1', ...entity })),
    };

    mockSettlementRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'settle-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'settle-uuid-1', ...entity })),
    };

    mockUserRepo = {
      findOne: vi.fn(),
      create: vi.fn((entity) => ({ id: 'user-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'user-uuid-1', ...entity })),
    };

    const mockAddressRepo = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn((entity) => ({ id: 'addr-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'addr-uuid-1', ...entity })),
    };

    const mockOrderRepo = {
      find: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    mockDataSource = {
      getRepository: vi.fn((entity) => {
        if (entity.name === 'Address') return mockAddressRepo;
        if (entity.name === 'Order') return mockOrderRepo;
        return mockUserRepo;
      }),
    };

    mockOrdersService = {
      checkout: vi.fn().mockResolvedValue({
        order: {
          id: 'ord-uuid-12345678',
          total: 1200,
          subtotal: 1150,
          status: 'PENDING',
        },
      }),
    };

    service = new AgentCommerceService(
      mockSessionRepo,
      mockTxRepo,
      mockCollectionRepo,
      mockSettlementRepo,
      mockUserRepo,
      mockDataSource,
      mockOrdersService,
    );
  });

  describe('openDrawerSession', () => {
    it('successfully opens a cash drawer with initial float', async () => {
      mockSessionRepo.findOne.mockResolvedValueOnce(null); // No existing open session
      const mockSaved = {
        id: 'session-uuid-1',
        agentId: 'agent-1',
        openingFloat: 2000,
        cashIn: 0,
        cashOut: 0,
        expectedClosingBalance: 2000,
        status: AgentSessionStatus.OPEN,
        transactions: [],
      };
      mockSessionRepo.findOne.mockResolvedValueOnce(mockSaved);

      const result = await service.openDrawerSession('agent-1', {
        openingFloat: 2000,
        openingNotes: 'Morning shift float',
      });

      expect(mockSessionRepo.create).toHaveBeenCalled();
      expect(mockTxRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: AgentCashTxType.CASH_IN_FLOAT_ADD,
          amount: 2000,
        }),
      );
      expect(result.status).toBe(AgentSessionStatus.OPEN);
    });

    it('throws BadRequestException if an active session is already open', async () => {
      mockSessionRepo.findOne.mockResolvedValueOnce({
        id: 'existing-session',
        status: AgentSessionStatus.OPEN,
      });

      await expect(
        service.openDrawerSession('agent-1', { openingFloat: 1000 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('closeDrawerSession', () => {
    it('computes closing balances and discrepancy correctly', async () => {
      mockSessionRepo.findOne.mockResolvedValueOnce({
        id: 'session-1',
        agentId: 'agent-1',
        openingFloat: 2000,
        cashIn: 5000,
        cashOut: 1500,
        status: AgentSessionStatus.OPEN,
      });

      // Expected = 2000 + 5000 - 1500 = 5500
      // Actual = 5450 (Shortage of 50 BDT)
      const result = await service.closeDrawerSession('agent-1', {
        actualClosingBalance: 5450,
        closingNotes: 'Small shortage due to change round-off',
      });

      expect(result.expectedClosingBalance).toBe(5500);
      expect(result.actualClosingBalance).toBe(5450);
      expect(result.discrepancy).toBe(-50);
      expect(result.status).toBe(AgentSessionStatus.CLOSED);
    });

    it('throws NotFoundException if no active session is found', async () => {
      mockSessionRepo.findOne.mockResolvedValueOnce(null);

      await expect(
        service.closeDrawerSession('agent-1', { actualClosingBalance: 5000 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('processAgentPosCheckout', () => {
    it('processes assisted order, calculates change, and records CASH_IN_ORDER', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        id: 'session-1',
        agentId: 'agent-1',
        openingFloat: 1000,
        cashIn: 0,
        cashOut: 0,
        status: AgentSessionStatus.OPEN,
      });

      const result = await service.processAgentPosCheckout('agent-1', {
        items: [{ sellerProductId: 'prod-1', quantity: 2 }],
        customerName: 'Rahim Uddin',
        customerPhone: '01712345678',
        customerAddress: 'Kazipur Char, Ward 3',
        amountTendered: 1500, // Total order is 1200
      });

      expect(result.orderTotal).toBe(1200);
      expect(result.amountTendered).toBe(1500);
      expect(result.changeDue).toBe(300);
      expect(result.agentCommission).toBe(23); // 2% of 1150
      expect(mockTxRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: AgentCashTxType.CASH_IN_ORDER,
          amount: 1200,
        }),
      );
    });

    it('throws BadRequestException if amountTendered is less than order total', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        id: 'session-1',
        agentId: 'agent-1',
        openingFloat: 1000,
        cashIn: 0,
        cashOut: 0,
        status: AgentSessionStatus.OPEN,
      });

      await expect(
        service.processAgentPosCheckout('agent-1', {
          items: [{ sellerProductId: 'prod-1', quantity: 2 }],
          customerName: 'Rahim Uddin',
          customerPhone: '01712345678',
          customerAddress: 'Kazipur Char, Ward 3',
          amountTendered: 1000, // less than 1200
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('recordFarmerCollection', () => {
    it('records crop collection and deducts payout from active cash drawer', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        id: 'session-1',
        agentId: 'agent-1',
        openingFloat: 10000,
        cashIn: 0,
        cashOut: 0,
        status: AgentSessionStatus.OPEN,
      });

      const result = await service.recordFarmerCollection('agent-1', {
        farmerName: 'Moklesur Rahman',
        farmerPhone: '01899998888',
        villageLocation: 'Sariakandi Riverbank',
        cropType: 'Miniket Paddy',
        quantityKg: 100,
        unitPricePerKg: 35,
        paidFromDrawer: true,
      });

      expect(result.totalPayout).toBe(3500);
      expect(result.status).toBe(FarmerCollectionStatus.COLLECTED);
      expect(mockTxRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: AgentCashTxType.CASH_OUT_PRODUCE_PAYOUT,
          amount: 3500,
        }),
      );
    });

    it('rejects collection if drawer has insufficient cash for farmer payout', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        id: 'session-1',
        agentId: 'agent-1',
        openingFloat: 1000,
        cashIn: 0,
        cashOut: 0,
        status: AgentSessionStatus.OPEN,
      });

      await expect(
        service.recordFarmerCollection('agent-1', {
          farmerName: 'Moklesur Rahman',
          farmerPhone: '01899998888',
          villageLocation: 'Sariakandi Riverbank',
          cropType: 'Miniket Paddy',
          quantityKg: 100,
          unitPricePerKg: 35, // 3500 BDT > 1000 BDT in drawer
          paidFromDrawer: true,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createCashSettlement & reviewSettlementAdmin', () => {
    it('creates a deposit voucher and updates to VERIFIED on admin review', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        id: 'session-1',
        agentId: 'agent-1',
        openingFloat: 5000,
        cashIn: 10000,
        cashOut: 0,
        status: AgentSessionStatus.OPEN,
      });

      const settlement = await service.createCashSettlement('agent-1', {
        amount: 8000,
        settlementChannel: SettlementChannel.POST_OFFICE,
        channelReference: 'Sariakandi Upazila Post Office Slip #4410',
      });

      expect(settlement.status).toBe(SettlementStatus.PENDING_REVIEW);
      expect(settlement.amount).toBe(8000);

      mockSettlementRepo.findOne.mockResolvedValueOnce({
        ...settlement,
        id: 'settle-1',
      });

      const reviewed = await service.reviewSettlementAdmin('settle-1', 'admin-super', {
        status: SettlementStatus.VERIFIED,
      });

      expect(reviewed.status).toBe(SettlementStatus.VERIFIED);
      expect(reviewed.verifiedByAdminId).toBe('admin-super');
      expect(reviewed.verifiedAt).toBeDefined();
    });
  });
});
