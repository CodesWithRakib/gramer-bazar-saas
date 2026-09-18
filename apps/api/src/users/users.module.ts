import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { User } from './entities/user.entity.js';
import { RoleEntity } from '../roles/entities/role.entity.js';
import { PermissionEntity } from '../permissions/entities/permission.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, RoleEntity, PermissionEntity])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
