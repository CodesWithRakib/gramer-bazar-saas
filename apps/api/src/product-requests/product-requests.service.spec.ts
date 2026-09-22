import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductRequestsService } from './product-requests.service.js';
import { ProductRequest } from './entities/product-request.entity.js';

describe('ProductRequestsService', () => {
  let service: ProductRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRequestsService,
        { provide: getRepositoryToken(ProductRequest), useValue: {} },
        { provide: DataSource, useValue: {} },
        { provide: EventEmitter2, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductRequestsService>(ProductRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
