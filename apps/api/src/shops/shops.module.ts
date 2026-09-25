import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { ShopsController } from './shops/shops.controller.js';
import { ShopsService } from './shops/shops.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, SellerProduct])],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [TypeOrmModule],
})
export class ShopsModule {}
