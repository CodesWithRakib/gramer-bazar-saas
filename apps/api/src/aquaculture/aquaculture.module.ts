import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HatcheryBatch } from './entities/hatchery-batch.entity.js';
import { PondIotTelemetry } from './entities/pond-iot-telemetry.entity.js';
import { FeedFcrLog } from './entities/feed-fcr-log.entity.js';
import { LiveFishTransportBooking } from './entities/live-fish-transport-booking.entity.js';
import { AquacultureService } from './aquaculture.service.js';
import { AquacultureController } from './aquaculture.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HatcheryBatch,
      PondIotTelemetry,
      FeedFcrLog,
      LiveFishTransportBooking,
    ]),
  ],
  controllers: [AquacultureController],
  providers: [AquacultureService],
  exports: [AquacultureService],
})
export class AquacultureModule {}
