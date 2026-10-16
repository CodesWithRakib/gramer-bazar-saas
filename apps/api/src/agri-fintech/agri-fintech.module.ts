import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmerCreditScore } from './entities/farmer-credit-score.entity.js';
import { MicroLoanApplication } from './entities/micro-loan-application.entity.js';
import { AgriFintechService } from './agri-fintech.service.js';
import { AgriFintechController } from './agri-fintech.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([FarmerCreditScore, MicroLoanApplication])],
  controllers: [AgriFintechController],
  providers: [AgriFintechService],
  exports: [TypeOrmModule, AgriFintechService],
})
export class AgriFintechModule {}
