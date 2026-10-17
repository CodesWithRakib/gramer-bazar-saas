import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpiceMarketService } from './spice-market.service.js';
import { SpiceMarketController } from './spice-market.controller.js';
import { SpiceDryingBatch } from './entities/spice-drying-batch.entity.js';
import { SpicePurityLabTest } from './entities/spice-purity-lab-test.entity.js';
import { SpiceForwardLot } from './entities/spice-forward-lot.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpiceDryingBatch,
      SpicePurityLabTest,
      SpiceForwardLot,
    ]),
  ],
  controllers: [SpiceMarketController],
  providers: [SpiceMarketService],
  exports: [SpiceMarketService],
})
export class SpiceMarketModule {}
