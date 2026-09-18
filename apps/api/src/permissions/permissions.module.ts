import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionEntity])],
  exports: [TypeOrmModule],
})
export class PermissionsModule {}
