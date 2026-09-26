import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@gramerbazar.com',
    description: 'Email address or 11-digit Bangladeshi mobile number',
  })
  @IsNotEmpty()
  @IsString()
  emailOrPhone: string;

  @ApiProperty({
    example: 'Secret123!',
    description: 'Account password (minimum 6 characters)',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
