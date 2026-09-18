import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  emailOrPhone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
