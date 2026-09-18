import { Test, TestingModule } from '@nestjs/testing';
import { SellerPortalService } from './seller-portal.service';

describe('SellerPortalService', () => {
  let service: SellerPortalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SellerPortalService],
    }).compile();

    service = module.get<SellerPortalService>(SellerPortalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
