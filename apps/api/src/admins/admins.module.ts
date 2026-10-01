import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsService } from './admins.service.js';
import { AdminsController } from './admins.controller.js';
import { User } from '../users/entities/user.entity.js';
import { RoleEntity } from '../roles/entities/role.entity.js';
import { PermissionEntity } from '../permissions/entities/permission.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, RoleEntity, PermissionEntity])],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminsModule {}
