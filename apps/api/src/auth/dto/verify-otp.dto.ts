import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^01[3-9]\d{8}$/, { message: 'Invalid BD phone number' })
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  otp: string;
}
