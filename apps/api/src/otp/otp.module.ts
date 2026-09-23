import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity.js';
import { OtpService } from './otp.service.js';
import { DevOtpController } from './dev-otp.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Otp])],
  controllers: [DevOtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
