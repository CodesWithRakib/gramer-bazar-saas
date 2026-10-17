import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DairyMilkCollectionEntry } from './entities/dairy-milk-collection-entry.entity.js';
import { MilkChillingVatTelemetry } from './entities/milk-chilling-vat-telemetry.entity.js';
import { LivestockFeedGroupBuyPool } from './entities/livestock-feed-group-buy-pool.entity.js';
import { DairySupplyService } from './dairy-supply.service.js';
import { DairySupplyController } from './dairy-supply.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DairyMilkCollectionEntry,
      MilkChillingVatTelemetry,
      LivestockFeedGroupBuyPool,
    ]),
  ],
  controllers: [DairySupplyController],
  providers: [DairySupplyService],
  exports: [DairySupplyService],
})
export class DairySupplyModule {}
