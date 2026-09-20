import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'OldPass123!' })
  @IsString()
  @Length(6, 100)
  currentPassword: string;

  @ApiProperty({ example: 'NewPass123!' })
  @IsString()
  @Length(6, 100)
  newPassword: string;
}
