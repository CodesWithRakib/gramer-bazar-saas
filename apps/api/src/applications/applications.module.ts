import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerApplication } from './entities/seller-application.entity.js';
import { RiderApplication } from './entities/rider-application.entity.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { RoleEntity } from '../roles/entities/role.entity.js';
import { ApplicationsService } from './applications.service.js';
import { ApplicationsController } from './applications.controller.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([SellerApplication, RiderApplication, Shop, RoleEntity]),
    UsersModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
