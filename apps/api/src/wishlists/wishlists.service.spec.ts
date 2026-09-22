import { Test, TestingModule } from '@nestjs/testing';
import { WishlistsService } from './wishlists.service.js';

describe('WishlistsService', () => {
  let service: WishlistsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WishlistsService],
    }).compile();

    service = module.get<WishlistsService>(WishlistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
