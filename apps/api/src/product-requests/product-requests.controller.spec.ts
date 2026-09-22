import { Test, TestingModule } from '@nestjs/testing';
import { ProductRequestsController } from './product-requests.controller.js';
import { ProductRequestsService } from './product-requests.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

describe('ProductRequestsController', () => {
  let controller: ProductRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductRequestsController],
      providers: [
        { provide: ProductRequestsService, useValue: {} },
        { provide: AuditLogsService, useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProductRequestsController>(ProductRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
