import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayoutsService } from './payouts.service.js';
import { PayoutsController } from './payouts.controller.js';
import { PayoutRequest } from './entities/payout-request.entity.js';
import { WalletsModule } from '../wallets/wallets.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([PayoutRequest]),
    WalletsModule,
  ],
  controllers: [PayoutsController],
  providers: [PayoutsService],
  exports: [PayoutsService],
})
export class PayoutsModule {}
