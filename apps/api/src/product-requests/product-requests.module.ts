import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRequestsService } from './product-requests.service.js';
import { ProductRequestsController } from './product-requests.controller.js';
import { ProductRequest } from './entities/product-request.entity.js';
import { ProductRequestHistory } from './entities/product-request-history.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ProductRequest, ProductRequestHistory])],
  controllers: [ProductRequestsController],
  providers: [ProductRequestsService],
})
export class ProductRequestsModule {}
