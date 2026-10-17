import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HerbalBatch } from './entities/herbal-batch.entity.js';
import { PharmaSourcingContract } from './entities/pharma-sourcing-contract.entity.js';
import { HerbalMoistureAudit } from './entities/herbal-moisture-audit.entity.js';
import { HerbalSupplyService } from './herbal-supply.service.js';
import { HerbalSupplyController } from './herbal-supply.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HerbalBatch,
      PharmaSourcingContract,
      HerbalMoistureAudit,
    ]),
  ],
  controllers: [HerbalSupplyController],
  providers: [HerbalSupplyService],
  exports: [HerbalSupplyService],
})
export class HerbalSupplyModule {}
