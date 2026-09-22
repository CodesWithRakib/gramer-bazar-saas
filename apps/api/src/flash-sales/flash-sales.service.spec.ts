import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FlashSalesService } from './flash-sales.service.js';
import { FlashSale } from './entities/flash-sale.entity.js';
import { FlashSaleItem } from './entities/flash-sale-item.entity.js';

describe('FlashSalesService', () => {
  let service: FlashSalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlashSalesService,
        { provide: getRepositoryToken(FlashSale), useValue: {} },
        { provide: getRepositoryToken(FlashSaleItem), useValue: {} },
      ],
    }).compile();

    service = module.get<FlashSalesService>(FlashSalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
