import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WarehouseHubService } from './warehouse-hub.service.js';
import { WarehouseHubType } from '../entities/warehouse-hub.entity.js';
import { StockTransferStatus } from '../entities/stock-transfer.entity.js';

describe('WarehouseHubService', () => {
  let service: WarehouseHubService;
  let hubRepo: any;
  let hubStockRepo: any;
  let transferRepo: any;
  let dataSource: any;
  let queryRunner: any;

  beforeEach(() => {
    hubRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((dto) => ({ id: 'hub-1', ...dto })),
      save: vi.fn(async (entity) => entity),
      createQueryBuilder: vi.fn(() => ({
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([{ id: 'hub-1', name: 'Bogra Hub' }]),
      })),
    };

    hubStockRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((dto) => ({ id: 'stock-1', ...dto })),
      save: vi.fn(async (entity) => entity),
    };

    transferRepo = {
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'trf-1', ...dto })),
      save: vi.fn(async (entity) => entity),
      createQueryBuilder: vi.fn(() => ({
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      })),
    };

    queryRunner = {
      connect: vi.fn(),
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      rollbackTransaction: vi.fn(),
      release: vi.fn(),
      manager: {
        save: vi.fn(async (entity) => entity),
        findOne: vi.fn(),
      },
    };

    dataSource = {
      createQueryRunner: vi.fn(() => queryRunner),
    };

    service = new WarehouseHubService(hubRepo, hubStockRepo, transferRepo, dataSource);
  });

  describe('createHub', () => {
    it('creates a new warehouse hub when code is unique', async () => {
      hubRepo.findOne.mockResolvedValue(null);

      const result = await service.createHub({
        name: 'Bogra Regional Hub',
        code: 'HUB-BGR-01',
        hubType: WarehouseHubType.REGIONAL,
        division: 'Rajshahi',
        district: 'Bogra',
      });

      expect(result.code).toBe('HUB-BGR-01');
      expect(hubRepo.save).toHaveBeenCalled();
    });

    it('throws BadRequestException if hub code already exists', async () => {
      hubRepo.findOne.mockResolvedValue({ id: 'existing' });

      await expect(
        service.createHub({
          name: 'Duplicate Hub',
          code: 'HUB-BGR-01',
          hubType: WarehouseHubType.REGIONAL,
          division: 'Rajshahi',
          district: 'Bogra',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createTransfer', () => {
    it('rejects transfer if source and destination are identical', async () => {
      await expect(
        service.createTransfer({
          fromHubId: 'hub-1',
          toHubId: 'hub-1',
          sellerProductId: 'prod-1',
          quantity: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects transfer if source has insufficient available stock', async () => {
      hubRepo.findOne.mockResolvedValue({ id: 'hub-1' });
      hubStockRepo.findOne.mockResolvedValue({
        quantity: 15,
        reservedQuantity: 10, // only 5 available
      });

      await expect(
        service.createTransfer({
          fromHubId: 'hub-1',
          toHubId: 'hub-2',
          sellerProductId: 'prod-1',
          quantity: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates transfer and reserves stock when stock is sufficient', async () => {
      hubRepo.findOne.mockResolvedValue({ id: 'hub-1' });
      hubStockRepo.findOne.mockResolvedValue({
        quantity: 50,
        reservedQuantity: 0,
      });

      const transfer = await service.createTransfer({
        fromHubId: 'hub-1',
        toHubId: 'hub-2',
        sellerProductId: 'prod-1',
        quantity: 20,
      });

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(transfer.status).toBe(StockTransferStatus.PENDING);
    });
  });

  describe('updateTransferStatus', () => {
    it('throws NotFoundException if transfer does not exist', async () => {
      transferRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateTransferStatus('missing-trf', StockTransferStatus.IN_TRANSIT),
      ).rejects.toThrow(NotFoundException);
    });

    it('successfully transitions from PENDING to IN_TRANSIT and deducts stock', async () => {
      const mockTransfer = {
        id: 'trf-1',
        fromHubId: 'hub-1',
        toHubId: 'hub-2',
        sellerProductId: 'prod-1',
        quantity: 10,
        status: StockTransferStatus.PENDING,
      };
      transferRepo.findOne.mockResolvedValue(mockTransfer);

      const fromStock = { quantity: 50, reservedQuantity: 10 };
      queryRunner.manager.findOne.mockResolvedValue(fromStock);

      const result = await service.updateTransferStatus(
        'trf-1',
        StockTransferStatus.IN_TRANSIT,
      );

      expect(fromStock.quantity).toBe(40);
      expect(fromStock.reservedQuantity).toBe(0);
      expect(result.status).toBe(StockTransferStatus.IN_TRANSIT);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });
  });
});
