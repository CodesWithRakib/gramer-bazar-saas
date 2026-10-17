import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LivestockListing } from './entities/livestock-listing.entity.js';
import { LivestockHealthPassport } from './entities/livestock-health-passport.entity.js';
import { ArtificialInseminationBooking } from './entities/artificial-insemination-booking.entity.js';
import { LivestockTransportBooking } from './entities/livestock-transport-booking.entity.js';
import { LivestockService } from './livestock.service.js';
import { LivestockController } from './livestock.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LivestockListing,
      LivestockHealthPassport,
      ArtificialInseminationBooking,
      LivestockTransportBooking,
    ]),
  ],
  controllers: [LivestockController],
  providers: [LivestockService],
  exports: [LivestockService],
})
export class LivestockModule {}
