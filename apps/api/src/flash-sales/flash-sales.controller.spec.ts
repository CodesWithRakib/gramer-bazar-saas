import { Test, TestingModule } from '@nestjs/testing';
import { FlashSalesController } from './flash-sales.controller.js';
import { FlashSalesService } from './flash-sales.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

describe('FlashSalesController', () => {
  let controller: FlashSalesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlashSalesController],
      providers: [{ provide: FlashSalesService, useValue: {} }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FlashSalesController>(FlashSalesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
