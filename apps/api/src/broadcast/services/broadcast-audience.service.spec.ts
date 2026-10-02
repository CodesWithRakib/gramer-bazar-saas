import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BroadcastAudienceService } from './broadcast-audience.service.js';
import { User } from '../../users/entities/user.entity.js';
import { CustomerMarketingPreference } from '../entities/customer-marketing-preference.entity.js';
import { BroadcastAudienceType } from '../enums/broadcast.enums.js';

function makeQueryBuilder(overrides: Record<string, unknown> = {}) {
  return {
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getMany: vi.fn().mockResolvedValue([]),
    getCount: vi.fn().mockResolvedValue(0),
    ...overrides,
  };
}

describe('BroadcastAudienceService', () => {
  let service: BroadcastAudienceService;
  let qb: ReturnType<typeof makeQueryBuilder>;

  const userRepo = { createQueryBuilder: vi.fn() };
  const preferenceRepo = { count: vi.fn().mockResolvedValue(0) };

  beforeEach(async () => {
    vi.clearAllMocks();
    qb = makeQueryBuilder();
    userRepo.createQueryBuilder.mockReturnValue(qb);
    preferenceRepo.count.mockResolvedValue(0);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BroadcastAudienceService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(CustomerMarketingPreference), useValue: preferenceRepo },
      ],
    }).compile();

    service = module.get(BroadcastAudienceService);
  });

  it('resolves recipients to a minimal snapshot', async () => {
    qb.getMany.mockResolvedValue([
      { id: 'u-1', firstName: 'Rakib', lastName: 'Hasan', phone: '+8801700000000' },
      { id: 'u-2', firstName: null, lastName: null, phone: '+8801700000001' },
    ]);

    const recipients = await service.resolveRecipients(BroadcastAudienceType.ALL_CUSTOMERS);

    expect(recipients).toEqual([
      { id: 'u-1', name: 'Rakib Hasan', phone: '+8801700000000', marketingOptIn: true },
      { id: 'u-2', name: null, phone: '+8801700000001', marketingOptIn: true },
    ]);
  });

  it('applies the marketing opt-out exclusion by default', async () => {
    await service.resolveRecipients(BroadcastAudienceType.ALL_CUSTOMERS);
    const sqlFragments = qb.andWhere.mock.calls.map((call) => String(call[0]));
    expect(sqlFragments.some((fragment) => fragment.includes('whatsapp_marketing_opt_in'))).toBe(
      true,
    );
  });

  it('skips the opt-out exclusion when isOptInRequired is false', async () => {
    await service.resolveRecipients(BroadcastAudienceType.ALL_CUSTOMERS, {
      isOptInRequired: false,
    });
    const sqlFragments = qb.andWhere.mock.calls.map((call) => String(call[0]));
    expect(sqlFragments.some((fragment) => fragment.includes('whatsapp_marketing_opt_in'))).toBe(
      false,
    );
  });

  it('previews audience counts and sample', async () => {
    let countCalls = 0;
    userRepo.createQueryBuilder.mockImplementation(() => {
      const builder = makeQueryBuilder();
      builder.getMany.mockResolvedValue([
        {
          id: 'u-1',
          firstName: 'Rakib',
          lastName: null,
          phone: '+8801700000000',
          email: 'r@example.com',
          lastLoginAt: new Date('2026-09-01T00:00:00.000Z'),
        },
      ]);
      builder.getCount.mockImplementation(async () => {
        countCalls += 1;
        // 1st = base audience with opt-in applied; later = ignoring opt-in.
        return countCalls === 1 ? 100 : 120;
      });
      return builder;
    });

    const preview = await service.preview(BroadcastAudienceType.ALL_CUSTOMERS);

    expect(preview.recipientCount).toBe(100);
    expect(preview.excludedOptOutCount).toBe(20);
    expect(preview.sample[0]).toMatchObject({ id: 'u-1', name: 'Rakib', marketingOptIn: true });
  });

  it('returns segment counts for the audience picker', async () => {
    const result = await service.getSegmentCounts();
    expect(result.segments).toEqual({
      totalCustomers: 0,
      optedInCustomers: 0,
      optedOutCustomers: 0,
    });
    expect(result.byAudienceType).toHaveProperty(BroadcastAudienceType.ALL_CUSTOMERS);
  });
});
