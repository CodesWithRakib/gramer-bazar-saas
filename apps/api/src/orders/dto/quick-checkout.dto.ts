import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../enums/order-status.enum.js';

export class QuickCheckoutDto {
  @ApiProperty({
    description: 'Full name of the recipient / customer',
    example: 'Karim Rahman',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '11-digit Bangladeshi contact phone number',
    example: '01712345678',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Full delivery address / village / union / thana',
    example: 'Gram: Bilbari, Union: Shonapur, Belkuchi, Sirajganj',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Seller product UUID to purchase',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  sellerProductId: string;

  @ApiPropertyOptional({
    description: 'Quantity to order',
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Payment method preference',
    enum: PaymentMethod,
    default: PaymentMethod.COD,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Optional Village Agent ID or UDC Entrepreneur Code',
    example: 'UDC-SIRAJ-042',
  })
  @IsOptional()
  @IsString()
  agentCode?: string;

  @ApiPropertyOptional({
    description: 'Language code for localized confirmation messages and callbacks',
    default: 'bn',
  })
  @IsOptional()
  @IsString()
  lang?: string;
}
