import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddDisputeMessageDto {
  @ApiProperty({ example: 'I have attached a photo of the damaged seal.' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/evidence2.jpg' })
  @IsString()
  @IsOptional()
  attachment?: string;
}
