import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { vi } from 'vitest';
import { WalletsService } from './wallets.service.js';
import { Wallet } from './entities/wallet.entity.js';
import { WalletTransaction } from './entities/wallet-transaction.entity.js';

describe('WalletsService', () => {
  let service: WalletsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        { provide: getRepositoryToken(Wallet), useValue: {} },
        { provide: getRepositoryToken(WalletTransaction), useValue: {} },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('delegates creditRefund to creditEarnings with appropriate description', async () => {
    const spy = vi.spyOn(service, 'creditEarnings').mockResolvedValue({} as any);
    await service.creditRefund('user-1', 500, 'ord-123', 'Damaged goods');
    expect(spy).toHaveBeenCalledWith('user-1', 500, 'Refund: Damaged goods', 'ord-123');
  });

  it('delegates creditCashback to creditEarnings with appropriate description', async () => {
    const spy = vi.spyOn(service, 'creditEarnings').mockResolvedValue({} as any);
    await service.creditCashback('user-1', 50, 'ord-123', 'Spring Bonus');
    expect(spy).toHaveBeenCalledWith('user-1', 50, 'Loyalty Cashback: Spring Bonus', 'ord-123');
  });
});
