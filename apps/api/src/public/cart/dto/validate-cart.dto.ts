import { IsArray, IsNotEmpty, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CartValidateItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'SellerProduct UUID' })
  @IsUUID()
  @IsNotEmpty()
  sellerProductId: string;

  @ApiProperty({ example: 2, description: 'Requested quantity', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ValidateCartDto {
  @ApiProperty({ type: [CartValidateItemDto], description: 'Cart items to validate' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartValidateItemDto)
  items: CartValidateItemDto[];
}

export class ValidatedCartItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  sellerProductId: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 45 })
  currentPrice: number;

  @ApiProperty({ example: 50 })
  originalPrice: number;

  @ApiProperty({ example: 25 })
  availableQuantity: number;

  @ApiProperty({ example: true })
  isValid: boolean;

  @ApiPropertyOptional({ example: null, nullable: true })
  error: string | null;
}

export class CartValidationResultDto {
  @ApiProperty({ type: [ValidatedCartItemResponseDto] })
  items: ValidatedCartItemResponseDto[];

  @ApiProperty({ example: 90, description: 'Validated total amount in BDT' })
  total: number;
}
