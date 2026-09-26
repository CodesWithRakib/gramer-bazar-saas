import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    example: '01712345678',
    description: '11-digit Bangladeshi mobile number starting with 013-019',
    pattern: '^01[3-9]\\d{8}$',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^01[3-9]\d{8}$/, { message: 'Invalid BD phone number' })
  phone: string;
}
