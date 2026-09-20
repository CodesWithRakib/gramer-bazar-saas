import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisputesService } from './disputes.service.js';
import { DisputesController } from './disputes.controller.js';
import { Dispute } from './entities/dispute.entity.js';
import { DisputeMessage } from './entities/dispute-message.entity.js';
import { Order } from '../orders/entities/order.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Dispute, DisputeMessage, Order])],
  controllers: [DisputesController],
  providers: [DisputesService],
})
export class DisputesModule {}
