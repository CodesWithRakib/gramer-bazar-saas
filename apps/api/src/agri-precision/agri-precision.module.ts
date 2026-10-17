import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgriInputRegistryItem } from './entities/agri-input-registry.entity.js';
import { AgriInputCounterfeitReport } from './entities/agri-input-counterfeit-report.entity.js';
import { DroneSprayingUnit } from './entities/drone-spraying-unit.entity.js';
import { DroneSprayingBooking } from './entities/drone-spraying-booking.entity.js';
import { SoilHealthCardRecord } from './entities/soil-health-card.entity.js';
import { User } from '../users/entities/user.entity.js';
import { AgriPrecisionService } from './agri-precision.service.js';
import { AgriPrecisionController } from './agri-precision.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgriInputRegistryItem,
      AgriInputCounterfeitReport,
      DroneSprayingUnit,
      DroneSprayingBooking,
      SoilHealthCardRecord,
      User,
    ]),
  ],
  controllers: [AgriPrecisionController],
  providers: [AgriPrecisionService],
  exports: [AgriPrecisionService],
})
export class AgriPrecisionModule {}
