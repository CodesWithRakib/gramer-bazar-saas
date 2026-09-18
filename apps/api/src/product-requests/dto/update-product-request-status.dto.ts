import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductRequestStatus } from '../enums/product-request-status.enum.js';

export class UpdateProductRequestStatusDto {
  @ApiProperty({ enum: ProductRequestStatus })
  @IsEnum(ProductRequestStatus)
  status: ProductRequestStatus;

  @ApiPropertyOptional({ description: 'Internal admin notes' })
  @IsString()
  @IsOptional()
  adminNotes?: string;

  @ApiPropertyOptional({ description: 'UUID of the linked product, if added to catalog' })
  @IsUUID()
  @IsOptional()
  linkedProductId?: string;

  @ApiPropertyOptional({ description: 'Remark to display to customer' })
  @IsString()
  @IsOptional()
  remark?: string;
}
