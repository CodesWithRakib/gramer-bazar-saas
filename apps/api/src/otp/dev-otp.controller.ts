import { Controller, Get, Param, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OtpService } from './otp.service.js';

/**
 * Dev-only endpoint for automated tests: the OTP journey is otherwise
 * unverifiable end-to-end because no real SMS provider is wired. Guarded the
 * same way as POST /dev/seed — hard-blocked when NODE_ENV === 'production'.
 */
@ApiTags('dev')
@Controller('dev/otp')
export class DevOtpController {
  constructor(private readonly otpService: OtpService) {}

  @Get(':phone')
  @ApiOperation({ summary: 'DEV ONLY — peek the latest active OTP for a phone' })
  async peekOtp(@Param('phone') phone: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new InternalServerErrorException('Dev OTP peek is not available in production');
    }

    const code = await this.otpService.peekLatestOtp(decodeURIComponent(phone));
    return { code };
  }
}
