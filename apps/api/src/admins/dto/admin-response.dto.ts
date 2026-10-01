import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../../users/enums/user-status.enum.js';

export class PermissionDto {
  @ApiProperty({ example: 'orders.update' })
  name: string;

  @ApiPropertyOptional({ example: 'Update order status and fulfillment', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ example: 'Orders', description: 'Module group for the permission UI' })
  group?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this permission is considered system-critical',
  })
  sensitive?: boolean;
}

export class AdminAccountDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: '01711223344' })
  phone: string;

  @ApiPropertyOptional({ example: 'admin2@gramerbazar.com', nullable: true })
  email: string | null;

  @ApiPropertyOptional({ example: 'Karim', nullable: true })
  firstName: string | null;

  @ApiPropertyOptional({ example: 'Ahmed', nullable: true })
  lastName: string | null;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiPropertyOptional({ nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: [String], example: ['ADMIN'] })
  roles: string[];

  @ApiProperty({
    type: [String],
    example: ['sellers.approve'],
    description: 'Explicit permissions granted directly to this account',
  })
  directPermissions: string[];

  @ApiProperty({
    type: [String],
    example: ['orders.read', 'sellers.approve'],
    description: 'Effective permissions (role permissions ∪ direct grants)',
  })
  effectivePermissions: string[];

  @ApiProperty({ example: false, description: 'True when the account is a Super Admin' })
  isSuperAdmin: boolean;
}
