import { Injectable, BadRequestException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Otp } from './entities/otp.entity.js';
import { SmsService } from './services/sms.service.js';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    @Optional()
    private readonly smsService?: SmsService,
  ) {}

  async generateOtp(phone: string, lang = 'bn'): Promise<string> {
    // Determine expiration time (e.g., 5 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Generate a 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const otp = this.otpRepository.create({
      phone,
      code,
      expiresAt,
    });

    await this.otpRepository.save(otp);

    // Dispatch SMS via configured provider (Mock, Greenweb, or BulkSMSBD)
    if (this.smsService) {
      await this.smsService.sendOtpSms(phone, code, lang);
    }
    return code;
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: {
        phone,
        expiresAt: MoreThan(new Date()),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!otp) {
      throw new BadRequestException('OTP expired or not found');
    }

    if (otp.attempts >= 3) {
      throw new BadRequestException('Too many attempts. Please request a new OTP.');
    }

    if (otp.code !== code) {
      otp.attempts += 1;
      await this.otpRepository.save(otp);
      throw new BadRequestException('Invalid OTP');
    }

    // OTP matched successfully. Invalidate it by deleting or marking as used.
    await this.otpRepository.remove(otp);
    return true;
  }

  /**
   * Dev-only helper: return the most recent active OTP for a phone number.
   * Used by automated tests because no real SMS provider is wired. Callers
   * must ensure this is never exposed in production (see OtpController).
   */
  async peekLatestOtp(phone: string): Promise<string> {
    const otp = await this.otpRepository.findOne({
      where: {
        phone,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      throw new BadRequestException('No active OTP for this phone');
    }
    return otp.code;
  }
}
