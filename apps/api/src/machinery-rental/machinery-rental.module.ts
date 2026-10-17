import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MachineryItem } from './entities/machinery-item.entity.js';
import { MachineryBooking } from './entities/machinery-booking.entity.js';
import { MachineryInspection } from './entities/machinery-inspection.entity.js';
import { User } from '../users/entities/user.entity.js';
import { MachineryRentalService } from './machinery-rental.service.js';
import { MachineryRentalController } from './machinery-rental.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MachineryItem,
      MachineryBooking,
      MachineryInspection,
      User,
    ]),
  ],
  controllers: [MachineryRentalController],
  providers: [MachineryRentalService],
  exports: [MachineryRentalService],
})
export class MachineryRentalModule {}
