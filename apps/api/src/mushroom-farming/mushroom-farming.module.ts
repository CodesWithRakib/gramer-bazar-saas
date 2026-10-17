import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MushroomSpawnBatch } from './entities/mushroom-spawn-batch.entity.js';
import { FruitingChamberTelemetry } from './entities/fruiting-chamber-telemetry.entity.js';
import { DehydratedMushroomLot } from './entities/dehydrated-mushroom-lot.entity.js';
import { MushroomFarmingService } from './mushroom-farming.service.js';
import { MushroomFarmingController } from './mushroom-farming.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MushroomSpawnBatch,
      FruitingChamberTelemetry,
      DehydratedMushroomLot,
    ]),
  ],
  controllers: [MushroomFarmingController],
  providers: [MushroomFarmingService],
  exports: [MushroomFarmingService],
})
export class MushroomFarmingModule {}
