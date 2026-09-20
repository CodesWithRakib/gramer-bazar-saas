import { IsArray, IsEnum, IsUUID, ValidateNested, ArrayMinSize, Min, IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../enums/order-status.enum.js';

export class CheckoutItemDto {
  @ApiProperty({ description: 'Seller Product ID' })
  @IsUUID()
  sellerProductId: string;

  @ApiProperty({ description: 'Quantity to purchase' })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CheckoutDto {
  @ApiProperty({ description: 'Address ID for delivery' })
  @IsUUID()
  addressId: string;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ type: [CheckoutItemDto], description: 'Items in the cart' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @ApiProperty({ description: 'Optional coupon code', required: false })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiProperty({ description: 'Language code for redirect URLs', required: false })
  @IsString()
  @IsOptional()
  lang?: string;
}
