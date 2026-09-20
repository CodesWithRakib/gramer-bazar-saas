import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashSalesService } from './flash-sales.service.js';
import { FlashSalesController } from './flash-sales.controller.js';
import { FlashSale } from './entities/flash-sale.entity.js';
import { FlashSaleItem } from './entities/flash-sale-item.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([FlashSale, FlashSaleItem])],
  providers: [FlashSalesService],
  controllers: [FlashSalesController]
})
export class FlashSalesModule {}
