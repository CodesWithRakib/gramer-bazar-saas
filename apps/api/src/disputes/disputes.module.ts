import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisputesService } from './disputes.service.js';
import { DisputesController } from './disputes.controller.js';
import { Dispute } from './entities/dispute.entity.js';
import { DisputeMessage } from './entities/dispute-message.entity.js';
import { DisputeInternalNote } from './entities/dispute-internal-note.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { WalletsModule } from '../wallets/wallets.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dispute, DisputeMessage, DisputeInternalNote, Order]),
    WalletsModule,
    NotificationsModule,
  ],
  controllers: [DisputesController],
  providers: [DisputesService],
})
export class DisputesModule {}
