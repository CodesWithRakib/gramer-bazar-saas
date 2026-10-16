import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MandiPriceRecord } from './entities/mandi-price.entity.js';
import { AgriIntelligenceService } from './agri-intelligence.service.js';
import { AgriIntelligenceController } from './agri-intelligence.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([MandiPriceRecord])],
  controllers: [AgriIntelligenceController],
  providers: [AgriIntelligenceService],
  exports: [TypeOrmModule, AgriIntelligenceService],
})
export class AgriIntelligenceModule {}
