import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Otp } from './entities/otp.entity.js';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  async generateOtp(phone: string): Promise<string> {
    // Determine expiration time (e.g., 5 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Generate a 6-digit OTP
    // For development/MVP, we can use a hardcoded or simple random generator.
    // In production, use a secure random generator and hash it in DB.
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const otp = this.otpRepository.create({
      phone,
      code,
      expiresAt,
    });

    await this.otpRepository.save(otp);
    
    // In a real app, you would dispatch a background job to send the SMS here.
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
}
