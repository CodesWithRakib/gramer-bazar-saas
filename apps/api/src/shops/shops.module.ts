import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity.js';
import { ShopsController } from './shops/shops.controller.js';
import { ShopsService } from './shops/shops.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Shop])],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [TypeOrmModule],
})
export class ShopsModule {}
