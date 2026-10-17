import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoultryHatcheryBatch } from './entities/poultry-hatchery-batch.entity.js';
import { BrooderShedTelemetry } from './entities/brooder-shed-telemetry.entity.js';
import { TableEggGradingLot } from './entities/table-egg-grading-lot.entity.js';
import { PoultryHatcheryService } from './poultry-hatchery.service.js';
import { PoultryHatcheryController } from './poultry-hatchery.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PoultryHatcheryBatch,
      BrooderShedTelemetry,
      TableEggGradingLot,
    ]),
  ],
  controllers: [PoultryHatcheryController],
  providers: [PoultryHatcheryService],
  exports: [PoultryHatcheryService],
})
export class PoultryHatcheryModule {}
