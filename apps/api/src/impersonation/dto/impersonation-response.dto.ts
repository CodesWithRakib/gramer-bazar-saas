import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImpersonationReason, ImpersonationStatus } from '../enums/impersonation.enum.js';

export class ImpersonationContextDto {
  @ApiProperty({ description: 'Impersonation session identifier' })
  sessionId: string;

  @ApiProperty({ description: 'Real Super Admin user id (ACTOR)' })
  actorUserId: string;

  @ApiPropertyOptional({ description: 'Super Admin display name' })
  actorName: string | null;

  @ApiProperty({ description: 'Impersonated user id (EFFECTIVE USER)' })
  targetUserId: string;

  @ApiPropertyOptional({ description: 'Impersonated user display name' })
  targetName: string | null;

  @ApiProperty({ description: 'Impersonated user role' })
  targetRole: string;

  @ApiProperty({ enum: ImpersonationReason })
  reason: ImpersonationReason;

  @ApiPropertyOptional({ nullable: true })
  reasonNote: string | null;

  @ApiProperty({ description: 'Session start timestamp' })
  startedAt: string;

  @ApiProperty({ description: 'Session expiry timestamp' })
  expiresAt: string;
}

export class ImpersonationSessionDto extends ImpersonationContextDto {
  @ApiProperty({ enum: ImpersonationStatus })
  status: ImpersonationStatus;

  @ApiPropertyOptional({ nullable: true })
  endedAt: string | null;

  @ApiPropertyOptional({ nullable: true })
  endReason: string | null;
}
