import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefreshDto {
  @ApiPropertyOptional({ description: 'Optional refresh token if not provided via HTTP-only cookie' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

