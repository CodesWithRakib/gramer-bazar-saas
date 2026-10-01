import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RejectDisputeDto {
  @ApiProperty({ example: 'Evidence does not show any damage' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ example: 'Verified with delivery company' })
  @IsString()
  @IsOptional()
  internalNote?: string;
}
