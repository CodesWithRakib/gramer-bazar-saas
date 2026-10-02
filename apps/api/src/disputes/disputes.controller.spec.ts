import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { DisputesController } from './disputes.controller.js';
import { DisputesService } from './disputes.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { DisputeReason } from './enums/dispute-reason.enum.js';
import { DisputeResolutionType } from './enums/dispute-resolution-type.enum.js';

describe('DisputesController', () => {
  let controller: DisputesController;

  const mockDisputesService = {
    createDispute: vi.fn().mockResolvedValue({ id: 'disp-1' }),
    getCustomerDisputes: vi.fn().mockResolvedValue([{ id: 'disp-1' }]),
    getSellerDisputes: vi.fn().mockResolvedValue([{ id: 'disp-1' }]),
    getAdminDisputes: vi.fn().mockResolvedValue([{ id: 'disp-1' }]),
    getDisputeDetails: vi.fn().mockResolvedValue({ id: 'disp-1' }),
    addMessage: vi.fn().mockResolvedValue({ id: 'msg-1' }),
    addInternalNote: vi.fn().mockResolvedValue({ id: 'note-1' }),
    resolveDispute: vi.fn().mockResolvedValue({ id: 'disp-1', status: 'RESOLVED' }),
    rejectDispute: vi.fn().mockResolvedValue({ id: 'disp-1', status: 'REJECTED' }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisputesController],
      providers: [{ provide: DisputesService, useValue: mockDisputesService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DisputesController>(DisputesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Customer: creates dispute', async () => {
    const req = { user: { id: 'cust-1' } };
    const dto = {
      orderId: 'ord-1',
      reason: DisputeReason.DAMAGED,
      description: 'Damaged package',
    };

    const result = await controller.create(req, dto);
    expect(result).toEqual({ id: 'disp-1' });
    expect(mockDisputesService.createDispute).toHaveBeenCalledWith('cust-1', dto);
  });

  it('Customer: lists customer disputes', async () => {
    const req = { user: { id: 'cust-1' } };
    const result = await controller.getCustomerDisputes(req);
    expect(result).toHaveLength(1);
    expect(mockDisputesService.getCustomerDisputes).toHaveBeenCalledWith('cust-1');
  });

  it('Seller: lists seller disputes', async () => {
    const req = { user: { id: 'seller-1' } };
    const result = await controller.getSellerDisputes(req);
    expect(result).toHaveLength(1);
    expect(mockDisputesService.getSellerDisputes).toHaveBeenCalledWith('seller-1');
  });

  it('Admin: lists admin disputes', async () => {
    const result = await controller.getAdminDisputes();
    expect(result).toHaveLength(1);
    expect(mockDisputesService.getAdminDisputes).toHaveBeenCalled();
  });

  it('Admin: resolves dispute', async () => {
    const req = { user: { id: 'admin-1' } };
    const dto = {
      resolutionType: DisputeResolutionType.FULL_REFUND,
      refundAmount: 500,
      adminDecision: 'Refunded customer',
    };

    const result = await controller.resolveDispute('disp-1', req, dto);
    expect(result).toEqual({ id: 'disp-1', status: 'RESOLVED' });
    expect(mockDisputesService.resolveDispute).toHaveBeenCalledWith('disp-1', 'admin-1', dto);
  });

  it('Admin: rejects dispute', async () => {
    const req = { user: { id: 'admin-1' } };
    const dto = { reason: 'No evidence provided' };

    const result = await controller.rejectDispute('disp-1', req, dto);
    expect(result).toEqual({ id: 'disp-1', status: 'REJECTED' });
    expect(mockDisputesService.rejectDispute).toHaveBeenCalledWith('disp-1', 'admin-1', dto);
  });
});
