import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductRequestDto {
  @ApiProperty({ description: 'The name of the product requested by the customer' })
  @IsString()
  @IsNotEmpty()
  requestedProductName: string;

  @ApiPropertyOptional({ description: 'Additional details or description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Preferred information like brand, size, quantity' })
  @IsString()
  @IsOptional()
  preferredInformation?: string;
}
