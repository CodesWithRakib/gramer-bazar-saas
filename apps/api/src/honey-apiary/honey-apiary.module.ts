import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HoneyHarvestLot } from './entities/honey-harvest-lot.entity.js';
import { ApiaryColonyBox } from './entities/apiary-colony-box.entity.js';
import { RoyalJellySuperfoodBatch } from './entities/royal-jelly-superfood-batch.entity.js';
import { HoneyApiaryService } from './honey-apiary.service.js';
import { HoneyApiaryController } from './honey-apiary.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HoneyHarvestLot,
      ApiaryColonyBox,
      RoyalJellySuperfoodBatch,
    ]),
  ],
  controllers: [HoneyApiaryController],
  providers: [HoneyApiaryService],
  exports: [HoneyApiaryService],
})
export class HoneyApiaryModule {}
