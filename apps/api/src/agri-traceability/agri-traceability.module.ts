import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduceBatch } from './entities/produce-batch.entity.js';
import { User } from '../users/entities/user.entity.js';
import { WarehouseHub } from '../inventory/entities/warehouse-hub.entity.js';
import { AgriTraceabilityService } from './agri-traceability.service.js';
import { AgriTraceabilityController } from './agri-traceability.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([ProduceBatch, User, WarehouseHub])],
  controllers: [AgriTraceabilityController],
  providers: [AgriTraceabilityService],
  exports: [AgriTraceabilityService],
})
export class AgriTraceabilityModule {}
