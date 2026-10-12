import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Otp } from './entities/otp.entity.js';
import { OtpService } from './otp.service.js';
import { DevOtpController } from './dev-otp.controller.js';
import { SmsService } from './services/sms.service.js';
import { MockSmsProvider } from './providers/mock-sms.provider.js';
import { GreenwebSmsProvider } from './providers/greenweb-sms.provider.js';
import { BulkSmsbdProvider } from './providers/bulksmsbd-sms.provider.js';

@Module({
  imports: [TypeOrmModule.forFeature([Otp]), ConfigModule],
  controllers: [DevOtpController],
  providers: [
    OtpService,
    SmsService,
    MockSmsProvider,
    GreenwebSmsProvider,
    BulkSmsbdProvider,
  ],
  exports: [OtpService, SmsService],
})
export class OtpModule {}

