import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ImpersonationService } from './impersonation.service.js';
import { ImpersonationController } from './impersonation.controller.js';
import { ImpersonationSession } from './entities/impersonation-session.entity.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([ImpersonationSession]), UsersModule],
  controllers: [ImpersonationController],
  providers: [ImpersonationService],
  exports: [ImpersonationService],
})
export class ImpersonationModule {}
