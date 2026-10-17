import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HandloomArtisanProduct } from './entities/handloom-artisan-product.entity.js';
import { SericultureCocoonBatch } from './entities/sericulture-cocoon-batch.entity.js';
import { ArtisanCustomOrder } from './entities/artisan-custom-order.entity.js';
import { SericultureHandloomService } from './sericulture-handloom.service.js';
import { SericultureHandloomController } from './sericulture-handloom.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HandloomArtisanProduct,
      SericultureCocoonBatch,
      ArtisanCustomOrder,
    ]),
  ],
  controllers: [SericultureHandloomController],
  providers: [SericultureHandloomService],
  exports: [SericultureHandloomService],
})
export class SericultureHandloomModule {}
