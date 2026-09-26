import { IsEnum, IsNotEmpty, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../enums/user-status.enum.js';

export class UpdateUserStatusDto {
  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    description: 'Updated user account lifecycle status',
  })
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class UpdateUserRolesDto {
  @ApiProperty({
    example: ['ADMIN', 'SELLER'],
    description: 'List of role names to assign to the user',
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  roles: string[];
}
