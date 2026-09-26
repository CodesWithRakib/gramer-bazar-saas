import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../../users/enums/user-status.enum.js';

export class AuthUserDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Unique user identifier' })
  id: string;

  @ApiProperty({ example: '01712345678', description: 'Normalized Bangladeshi phone number' })
  phone: string;

  @ApiPropertyOptional({ example: 'customer@example.com', nullable: true, description: 'User email address' })
  email?: string | null;

  @ApiPropertyOptional({ example: 'Rahim', nullable: true, description: 'User first name' })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Uddin', nullable: true, description: 'User last name' })
  lastName?: string | null;

  @ApiProperty({ example: ['CUSTOMER'], description: 'Assigned system roles', type: [String] })
  roles: string[];
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT bearer access token' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT refresh token' })
  refreshToken: string;

  @ApiProperty({ type: AuthUserDto, description: 'Authenticated user credentials and roles' })
  user: AuthUserDto;
}

export class UserProfileResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Unique user identifier' })
  id: string;

  @ApiProperty({ example: '01712345678', description: 'User phone number' })
  phone: string;

  @ApiPropertyOptional({ example: 'user@example.com', nullable: true, description: 'User email' })
  email?: string | null;

  @ApiPropertyOptional({ example: 'Rahim', nullable: true, description: 'First name' })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Uddin', nullable: true, description: 'Last name' })
  lastName?: string | null;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE, description: 'User status' })
  status: UserStatus;

  @ApiProperty({ example: true, description: 'Whether phone verification is complete' })
  isPhoneVerified: boolean;

  @ApiProperty({ example: false, description: 'Whether email verification is complete' })
  isEmailVerified: boolean;

  @ApiPropertyOptional({ example: 'https://storage.gramerbazar.com/avatars/user.jpg', nullable: true, description: 'Avatar URL' })
  avatar?: string | null;

  @ApiPropertyOptional({ example: '2026-09-26T10:00:00.000Z', nullable: true, description: 'Last login timestamp' })
  lastLoginAt?: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Account creation timestamp' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z', description: 'Profile update timestamp' })
  updatedAt: string;

  @ApiProperty({ example: ['CUSTOMER'], description: 'List of role names', type: [String] })
  roles: string[];
}

export class SendOtpResponseDto {
  @ApiProperty({ example: 'OTP sent successfully', description: 'Status message' })
  message: string;
}
