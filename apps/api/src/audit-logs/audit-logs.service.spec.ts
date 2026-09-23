import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity.js';
import { AuditLogsService } from './audit-logs.service.js';

describe('AuditLogsService', () => {
  let service: AuditLogsService;

  const queryBuilder = {
    orderBy: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn(),
  };

  const repository = {
    create: vi.fn((x) => x),
    save: vi.fn(),
    createQueryBuilder: vi.fn(() => queryBuilder),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        { provide: getRepositoryToken(AuditLog), useValue: repository },
      ],
    }).compile();

    service = module.get<AuditLogsService>(AuditLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('record', () => {
    it('persists an entry with null fallbacks', async () => {
      repository.save.mockResolvedValue(undefined);

      await service.record({ action: 'ORDER_STATUS_UPDATED' });

      expect(repository.create).toHaveBeenCalledWith({
        actorId: null,
        actorName: null,
        action: 'ORDER_STATUS_UPDATED',
        targetType: null,
        targetId: null,
        details: null,
      });
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('swallows persistence failures so callers never break', async () => {
      repository.save.mockRejectedValue(new Error('db down'));

      await expect(
        service.record({ action: 'X', actorId: 'u1' }),
      ).resolves.toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('returns a {data, meta} envelope with computed totalPages', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([[{ id: 'l1' }], 21]);

      const result = await service.findAll(1, 20);

      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(20);
      expect(result).toEqual({
        data: [{ id: 'l1' }],
        meta: { total: 21, page: 1, limit: 20, totalPages: 2 },
      });
    });

    it('applies the search filter when provided', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll(2, 10, 'login');

      expect(queryBuilder.andWhere).toHaveBeenCalled();
      expect(queryBuilder.skip).toHaveBeenCalledWith(10);
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('computes a single page when total fits in one page', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([[{}, {}], 2]);

      const result = await service.findAll(1, 20);

      expect(result.meta.totalPages).toBe(1);
    });
  });
});
