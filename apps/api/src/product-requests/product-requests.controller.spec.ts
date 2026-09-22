import { Test, TestingModule } from '@nestjs/testing';
import { ProductRequestsController } from './product-requests.controller.js';

describe('ProductRequestsController', () => {
  let controller: ProductRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductRequestsController],
    }).compile();

    controller = module.get<ProductRequestsController>(ProductRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
