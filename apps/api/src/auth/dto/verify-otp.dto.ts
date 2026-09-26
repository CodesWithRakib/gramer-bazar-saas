import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    example: '01712345678',
    description: '11-digit Bangladeshi mobile number',
    pattern: '^01[3-9]\\d{8}$',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^01[3-9]\d{8}$/, { message: 'Invalid BD phone number' })
  phone: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP verification code',
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  otp: string;
}
