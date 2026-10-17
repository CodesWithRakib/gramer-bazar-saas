import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupBuyCampaign } from './entities/group-buy-campaign.entity.js';
import { GroupBuyPool } from './entities/group-buy-pool.entity.js';
import { GroupBuyMember } from './entities/group-buy-member.entity.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { User } from '../users/entities/user.entity.js';
import { GroupBuyingService } from './group-buying.service.js';
import { GroupBuyingController } from './group-buying.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GroupBuyCampaign,
      GroupBuyPool,
      GroupBuyMember,
      SellerProduct,
      User,
    ]),
  ],
  controllers: [GroupBuyingController],
  providers: [GroupBuyingService],
  exports: [GroupBuyingService],
})
export class GroupBuyingModule {}
