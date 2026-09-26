import { Controller, Get, Param, InternalServerErrorException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { OtpService } from './otp.service.js';
import { DevOtpResponseDto } from './dto/dev-otp-response.dto.js';
import {
  ApiStandardResponse,
  ApiCommonErrors,
} from '../common/decorators/api-standard-response.decorator.js';

@ApiTags('Dev / Seeder')
@Controller('dev/otp')
export class DevOtpController {
  constructor(private readonly otpService: OtpService) {}

  @Get(':phone')
  @ApiOperation({
    summary: 'Retrieve latest active OTP for automated testing',
    description: 'DEV ONLY — Peeks the latest active OTP code for a phone number. Hard-blocked in production.',
  })
  @ApiParam({ name: 'phone', type: String, example: '01712345678', description: 'Phone number' })
  @ApiStandardResponse({
    type: DevOtpResponseDto,
    status: HttpStatus.OK,
    description: 'Active OTP code or null',
  })
  @ApiCommonErrors([500])
  async peekOtp(@Param('phone') phone: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new InternalServerErrorException('Dev OTP peek is not available in production');
    }

    const code = await this.otpService.peekLatestOtp(decodeURIComponent(phone));
    return { code };
  }
}
