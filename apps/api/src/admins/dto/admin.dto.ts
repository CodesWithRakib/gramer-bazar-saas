import {
  IsArray,
  IsEnum,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../roles/enums/role.enum.js';
import { UserStatus } from '../../users/enums/user-status.enum.js';

/** Only administrative roles may be managed through this module. */
const ADMIN_ROLES = [Role.ADMIN, Role.SUPER_ADMIN] as const;

export class CreateAdminDto {
  @ApiProperty({ example: 'Karim', description: 'Admin first name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Ahmed', description: 'Admin last name' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: '01711223344', description: 'Mobile phone number' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'admin2@gramerbazar.com', description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'SecurePass@123', description: 'Initial password (min 8 characters)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    enum: ADMIN_ROLES,
    example: Role.ADMIN,
    description: 'Administrative role to assign',
  })
  @IsIn(ADMIN_ROLES)
  role: Role.ADMIN | Role.SUPER_ADMIN;

  @ApiPropertyOptional({
    example: ['sellers.approve', 'payouts.approve'],
    type: [String],
    description: 'Optional explicit permission grants applied to the new account',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class UpdateAdminDto {
  @ApiPropertyOptional({ example: 'Karim' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Ahmed' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '01711223344' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'admin2@gramerbazar.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: UserStatus, example: UserStatus.ACTIVE })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class AssignAdminPermissionsDto {
  @ApiProperty({
    example: ['sellers.approve', 'payouts.approve'],
    type: [String],
    description: 'Complete set of explicit permissions granted directly to the admin account',
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

export class ResetAdminPasswordDto {
  @ApiProperty({ example: 'NewSecurePass@123', description: 'New password (min 8 characters)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class UpdateRolePermissionsDto {
  @ApiProperty({
    example: ['orders.read', 'orders.update'],
    type: [String],
    description: 'Complete permission set assigned to the role',
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
