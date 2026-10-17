import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GhaniPressingBatch } from './entities/ghani-pressing-batch.entity.js';
import { OilPurityLabTest } from './entities/oil-purity-lab-test.entity.js';
import { ArtisanalOilLot } from './entities/artisanal-oil-lot.entity.js';
import { EdibleOilService } from './edible-oil.service.js';
import { EdibleOilController } from './edible-oil.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GhaniPressingBatch,
      OilPurityLabTest,
      ArtisanalOilLot,
    ]),
  ],
  controllers: [EdibleOilController],
  providers: [EdibleOilService],
  exports: [EdibleOilService],
})
export class EdibleOilModule {}
