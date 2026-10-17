import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractFarmingCampaign } from './entities/contract-farming-campaign.entity.js';
import { ContractFarmingAgreement } from './entities/contract-farming-agreement.entity.js';
import { ContractMilestoneInspection } from './entities/contract-milestone-inspection.entity.js';
import { ContractHarvestDelivery } from './entities/contract-harvest-delivery.entity.js';
import { User } from '../users/entities/user.entity.js';
import { ContractFarmingService } from './contract-farming.service.js';
import { ContractFarmingController } from './contract-farming.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContractFarmingCampaign,
      ContractFarmingAgreement,
      ContractMilestoneInspection,
      ContractHarvestDelivery,
      User,
    ]),
  ],
  controllers: [ContractFarmingController],
  providers: [ContractFarmingService],
  exports: [ContractFarmingService],
})
export class ContractFarmingModule {}
