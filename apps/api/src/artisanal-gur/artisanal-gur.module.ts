import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatePalmTappingBatch } from './entities/date-palm-tapping-batch.entity.js';
import { GurPurityLabTest } from './entities/gur-purity-lab-test.entity.js';
import { ArtisanalGurLot } from './entities/artisanal-gur-lot.entity.js';
import { ArtisanalGurService } from './artisanal-gur.service.js';
import { ArtisanalGurController } from './artisanal-gur.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DatePalmTappingBatch,
      GurPurityLabTest,
      ArtisanalGurLot,
    ]),
  ],
  controllers: [ArtisanalGurController],
  providers: [ArtisanalGurService],
  exports: [ArtisanalGurService],
})
export class ArtisanalGurModule {}
