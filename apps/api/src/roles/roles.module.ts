import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity.js';
import { RolesService } from './roles.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity])],
  providers: [RolesService],
  exports: [TypeOrmModule, RolesService],
})
export class RolesModule {}
