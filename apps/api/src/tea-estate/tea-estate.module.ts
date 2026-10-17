import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeaGreenLeafIntake } from './entities/tea-green-leaf-intake.entity.js';
import { TeaFactoryBatch } from './entities/tea-factory-batch.entity.js';
import { TeaAuctionLot } from './entities/tea-auction-lot.entity.js';
import { TeaEstateService } from './tea-estate.service.js';
import { TeaEstateController } from './tea-estate.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TeaGreenLeafIntake,
      TeaFactoryBatch,
      TeaAuctionLot,
    ]),
  ],
  controllers: [TeaEstateController],
  providers: [TeaEstateService],
  exports: [TeaEstateService],
})
export class TeaEstateModule {}
