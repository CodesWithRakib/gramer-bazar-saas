import { ApiPropertyOptional } from '@nestjs/swagger';

export class DevOtpResponseDto {
  @ApiPropertyOptional({ example: '123456', nullable: true, description: 'Latest active OTP code generated for the phone' })
  code: string | null;
}
