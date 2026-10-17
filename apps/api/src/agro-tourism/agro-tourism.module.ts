import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmStayListing } from './entities/farm-stay-listing.entity.js';
import { AgroExperiencePackage } from './entities/agro-experience-package.entity.js';
import { FarmStayBooking } from './entities/farm-stay-booking.entity.js';
import { AgroTourismService } from './agro-tourism.service.js';
import { AgroTourismController } from './agro-tourism.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FarmStayListing,
      AgroExperiencePackage,
      FarmStayBooking,
    ]),
  ],
  controllers: [AgroTourismController],
  providers: [AgroTourismService],
  exports: [AgroTourismService],
})
export class AgroTourismModule {}
