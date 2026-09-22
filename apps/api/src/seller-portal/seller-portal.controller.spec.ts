import { Test, TestingModule } from '@nestjs/testing';
import { SellerPortalController } from './seller-portal.controller.js';
import { SellerPortalService } from './seller-portal.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

describe('SellerPortalController', () => {
  let controller: SellerPortalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerPortalController],
      providers: [{ provide: SellerPortalService, useValue: {} }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SellerPortalController>(SellerPortalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
