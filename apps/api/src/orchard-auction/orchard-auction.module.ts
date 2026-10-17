import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrchardAuctionService } from './orchard-auction.service.js';
import { OrchardAuctionController } from './orchard-auction.controller.js';
import { OrchardTreeAuctionLot } from './entities/orchard-tree-auction-lot.entity.js';
import { PhytosanitaryHwtBatch } from './entities/phytosanitary-hwt-batch.entity.js';
import { OrchardHarvestDispatch } from './entities/orchard-harvest-dispatch.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrchardTreeAuctionLot,
      PhytosanitaryHwtBatch,
      OrchardHarvestDispatch,
    ]),
  ],
  controllers: [OrchardAuctionController],
  providers: [OrchardAuctionService],
  exports: [OrchardAuctionService],
})
export class OrchardAuctionModule {}
