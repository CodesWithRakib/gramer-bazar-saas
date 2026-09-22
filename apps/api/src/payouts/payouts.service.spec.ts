import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PayoutsService } from './payouts.service.js';
import { PayoutRequest } from './entities/payout-request.entity.js';
import { WalletsService } from '../wallets/wallets.service.js';

describe('PayoutsService', () => {
  let service: PayoutsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutsService,
        { provide: getRepositoryToken(PayoutRequest), useValue: {} },
        { provide: WalletsService, useValue: {} },
      ],
    }).compile();

    service = module.get<PayoutsService>(PayoutsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
