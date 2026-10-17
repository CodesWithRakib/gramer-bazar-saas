import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JuteRettingBatch } from './entities/jute-retting-batch.entity.js';
import { JuteFiberLot } from './entities/jute-fiber-lot.entity.js';
import { JuteB2bContract } from './entities/jute-b2b-contract.entity.js';
import { JuteBiotechService } from './jute-biotech.service.js';
import { JuteBiotechController } from './jute-biotech.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JuteRettingBatch,
      JuteFiberLot,
      JuteB2bContract,
    ]),
  ],
  controllers: [JuteBiotechController],
  providers: [JuteBiotechService],
  exports: [JuteBiotechService],
})
export class JuteBiotechModule {}
