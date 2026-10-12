import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CourierProviderType {
  MOCK = 'MOCK',
  STEADFAST = 'STEADFAST',
  PATHAO = 'PATHAO',
}

export class BookCourierDto {
  @ApiProperty({
    description: 'UUID of the order to book for 3PL delivery',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiPropertyOptional({
    description: 'Preferred courier provider',
    enum: CourierProviderType,
    default: CourierProviderType.MOCK,
  })
  @IsOptional()
  @IsEnum(CourierProviderType)
  provider?: CourierProviderType;

  @ApiPropertyOptional({
    description: 'Optional handling note for courier parcel',
    example: 'Handle with care - fragile rural honey jars',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
