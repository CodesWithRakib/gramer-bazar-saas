import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RidersService } from './riders.service.js';
import { RidersController } from './riders.controller.js';
import { RiderProfile } from './entities/rider-profile.entity.js';
import { RiderEarning } from './entities/rider-earning.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Delivery } from '../deliveries/entities/delivery.entity.js';
import { PayoutRequest } from '../payouts/entities/payout-request.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([RiderProfile, RiderEarning, User, Delivery, PayoutRequest]),
  ],
  controllers: [RidersController],
  providers: [RidersService],
  exports: [RidersService],
})
export class RidersModule {}
