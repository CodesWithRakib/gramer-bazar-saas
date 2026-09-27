import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PayoutsService } from './payouts.service.js';
import { PayoutRequest } from './entities/payout-request.entity.js';
import { WalletsService } from '../wallets/wallets.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

describe('PayoutsService', () => {
  let service: PayoutsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutsService,
        { provide: getRepositoryToken(PayoutRequest), useValue: {} },
        { provide: WalletsService, useValue: {} },
        {
          provide: NotificationsService,
          useValue: {
            notifyUser: vi.fn().mockResolvedValue(null),
            notifyUsers: vi.fn().mockResolvedValue([]),
            notifyRole: vi.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<PayoutsService>(PayoutsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
