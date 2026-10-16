import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentCashDrawerSession } from './entities/agent-cash-drawer-session.entity.js';
import { AgentCashTransaction } from './entities/agent-cash-transaction.entity.js';
import { FarmerProduceCollection } from './entities/farmer-produce-collection.entity.js';
import { AgentCashSettlement } from './entities/agent-cash-settlement.entity.js';
import { User } from '../users/entities/user.entity.js';
import { OrdersModule } from '../orders/orders.module.js';
import { AgentCommerceService } from './agent-commerce.service.js';
import { AgentCommerceController } from './agent-commerce.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentCashDrawerSession,
      AgentCashTransaction,
      FarmerProduceCollection,
      AgentCashSettlement,
      User,
    ]),
    OrdersModule,
  ],
  controllers: [AgentCommerceController],
  providers: [AgentCommerceService],
  exports: [AgentCommerceService],
})
export class AgentCommerceModule {}
