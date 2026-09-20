import { IsString, IsBoolean, IsOptional, IsDateString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFlashSaleItemDto {
  @IsString()
  sellerProductId: string;

  @IsNumber()
  discountPrice: number;

  @IsNumber()
  @IsOptional()
  quantityAvailable?: number;
}

export class CreateFlashSaleDto {
  @IsString()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  bannerImage?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFlashSaleItemDto)
  @IsOptional()
  items?: CreateFlashSaleItemDto[];
}
