import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity])],
  exports: [TypeOrmModule],
})
export class RolesModule {}
