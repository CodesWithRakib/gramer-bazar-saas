import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponsService } from './coupons.service.js';
import { CouponsController } from './coupons.controller.js';
import { Coupon } from './entities/coupon.entity.js';
import { CouponUsage } from './entities/coupon-usage.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, CouponUsage])],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
