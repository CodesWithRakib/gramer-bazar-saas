import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChhanaProductionBatch } from './entities/chhana-production-batch.entity.js';
import { SweetmeatPurityLabTest } from './entities/sweetmeat-purity-lab-test.entity.js';
import { ArtisanalSweetmeatLot } from './entities/artisanal-sweetmeat-lot.entity.js';
import { ArtisanalSweetmeatsService } from './artisanal-sweetmeats.service.js';
import { ArtisanalSweetmeatsController } from './artisanal-sweetmeats.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChhanaProductionBatch,
      SweetmeatPurityLabTest,
      ArtisanalSweetmeatLot,
    ]),
  ],
  controllers: [ArtisanalSweetmeatsController],
  providers: [ArtisanalSweetmeatsService],
  exports: [ArtisanalSweetmeatsService],
})
export class ArtisanalSweetmeatsModule {}
