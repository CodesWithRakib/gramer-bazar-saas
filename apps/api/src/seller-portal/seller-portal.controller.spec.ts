import { Test, TestingModule } from '@nestjs/testing';
import { SellerPortalController } from './seller-portal.controller';

describe('SellerPortalController', () => {
  let controller: SellerPortalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerPortalController],
    }).compile();

    controller = module.get<SellerPortalController>(SellerPortalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
