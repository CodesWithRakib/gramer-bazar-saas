import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../enums/user-status.enum.js';

export class UserRoleDto {
  @ApiProperty({ example: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f', description: 'Unique role identifier' })
  id: string;

  @ApiProperty({ example: 'ADMIN', description: 'Name of the role' })
  name: string;

  @ApiPropertyOptional({ example: 'Administrator with full system privileges', description: 'Role description', nullable: true })
  description?: string | null;
}

export class UserResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Unique user identifier' })
  id: string;

  @ApiProperty({ example: '01712345678', description: 'Normalized Bangladeshi mobile number' })
  phone: string;

  @ApiPropertyOptional({ example: 'user@example.com', nullable: true, description: 'User email address' })
  email: string | null;

  @ApiPropertyOptional({ example: 'Rahim', nullable: true, description: 'User first name' })
  firstName: string | null;

  @ApiPropertyOptional({ example: 'Uddin', nullable: true, description: 'User last name' })
  lastName: string | null;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE, description: 'Current user account status' })
  status: UserStatus;

  @ApiProperty({ example: true, description: 'Whether phone verification has been completed' })
  isPhoneVerified: boolean;

  @ApiProperty({ example: false, description: 'Whether email verification has been completed' })
  isEmailVerified: boolean;

  @ApiPropertyOptional({ example: 'https://storage.gramerbazar.com/avatars/user.jpg', nullable: true, description: 'Avatar image URL' })
  avatar: string | null;

  @ApiPropertyOptional({ example: '2026-09-26T10:00:00.000Z', nullable: true, description: 'Timestamp of last successful login' })
  lastLoginAt: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Account creation date' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z', description: 'Account last update date' })
  updatedAt: string;

  @ApiProperty({ type: [UserRoleDto], description: 'Assigned user roles' })
  roles: UserRoleDto[];
}
