import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';

import { BroadcastTemplatesService } from './broadcast-templates.service.js';
import { BroadcastTemplate } from '../entities/broadcast-template.entity.js';
import { BroadcastProviderRegistry } from '../providers/broadcast-provider.registry.js';
import { AuditLogsService } from '../../audit-logs/audit-logs.service.js';
import {
  BroadcastProviderName,
  BroadcastTemplateCategory,
} from '../enums/broadcast.enums.js';

describe('BroadcastTemplatesService', () => {
  let service: BroadcastTemplatesService;

  const templateRepo = {
    create: vi.fn((x) => x),
    save: vi.fn(async (x: unknown) => ({ ...(x as object), id: 'tmpl-1' })),
    findOne: vi.fn(),
    remove: vi.fn(),
    createQueryBuilder: vi.fn(),
  };
  const providerRegistry = { getActiveName: vi.fn(() => BroadcastProviderName.MOCK) };
  const auditLogsService = { record: vi.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    vi.clearAllMocks();
    templateRepo.save.mockImplementation(async (x: unknown) => ({ ...(x as object), id: 'tmpl-1' }));
    auditLogsService.record.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BroadcastTemplatesService,
        { provide: getRepositoryToken(BroadcastTemplate), useValue: templateRepo },
        { provide: BroadcastProviderRegistry, useValue: providerRegistry },
        { provide: AuditLogsService, useValue: auditLogsService },
      ],
    }).compile();

    service = module.get(BroadcastTemplatesService);
  });

  const baseDto = {
    name: 'Flash Sale',
    body: 'Hi {{customer_name}}, {{discount}}% off!',
    category: BroadcastTemplateCategory.MARKETING,
  };

  it('creates a template and derives structured variables from the body', async () => {
    const created = await service.create(baseDto as never, 'admin-1');
    expect(created.variables.map((v) => v.key)).toEqual(['customer_name', 'discount']);
    expect(auditLogsService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'BROADCAST_TEMPLATE_CREATED' }),
    );
  });

  it('rejects malformed variable syntax', async () => {
    await expect(
      service.create({ ...baseDto, body: 'Hi {{broken' } as never, 'admin-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects bodies referencing undeclared variables when a list is provided', async () => {
    await expect(
      service.create(
        { ...baseDto, variables: [{ key: 'customer_name' }] } as never,
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('allows creation without a declared variable list', async () => {
    const created = await service.create(baseDto as never, 'admin-1');
    expect(created.variables).toHaveLength(2);
  });
});
